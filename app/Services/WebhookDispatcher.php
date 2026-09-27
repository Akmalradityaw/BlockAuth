<?php

namespace App\Services;

use App\Models\Webhook;
use App\Models\WebhookDelivery;
use Illuminate\Support\Facades\Http;
use Throwable;

class WebhookDispatcher
{
    public static function dispatch(string $event, array $payload): void
    {
        $webhooks = Webhook::where('is_active', true)->get();

        foreach ($webhooks as $webhook) {
            $events = $webhook->events ?? [];

            if (! in_array('*', $events) && ! in_array($event, $events)) {
                continue;
            }

            static::send($webhook, $event, $payload);
        }
    }

    public static function send(Webhook $webhook, string $event, array $payload): WebhookDelivery
    {
        $jsonPayload = json_encode([
            'event' => $event,
            'timestamp' => now()->toIso8601String(),
            'data' => $payload,
        ]);

        $signature = hash_hmac('sha256', $jsonPayload, $webhook->secret);

        $startTime = microtime(true);
        $status = null;
        $responseBody = null;

        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'BlockAuth-Webhook/1.0',
                    'X-BlockAuth-Event' => $event,
                    'X-BlockAuth-Signature' => 'sha256=' . $signature,
                ])
                ->withBody($jsonPayload, 'application/json')
                ->post($webhook->url);

            $status = $response->status();
            $responseBody = substr($response->body(), 0, 1000);
        } catch (Throwable $e) {
            $status = 0;
            $responseBody = substr($e->getMessage(), 0, 1000);
        }

        $durationMs = (int) round((microtime(true) - $startTime) * 1000);

        return WebhookDelivery::create([
            'webhook_id' => $webhook->id,
            'event' => $event,
            'payload' => $payload,
            'response_status' => $status,
            'response_body' => $responseBody,
            'duration_ms' => $durationMs,
            'created_at' => now(),
        ]);
    }
}
