<?php

namespace Tests\Feature;

use App\Models\Webhook;
use App\Services\WebhookDispatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_can_be_dispatched_and_recorded(): void
    {
        Http::fake([
            'https://example.com/webhook' => Http::response(['ok' => true], 200),
        ]);

        $webhook = Webhook::create([
            'name' => 'Slack Alert',
            'url' => 'https://example.com/webhook',
            'secret' => 'whsec_secret123',
            'events' => ['user.registered'],
            'is_active' => true,
        ]);

        WebhookDispatcher::dispatch('user.registered', [
            'id' => 1,
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $this->assertDatabaseHas('webhook_deliveries', [
            'webhook_id' => $webhook->id,
            'event' => 'user.registered',
            'response_status' => 200,
        ]);
    }
}
