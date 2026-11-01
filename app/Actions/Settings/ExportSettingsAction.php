<?php

namespace App\Actions\Settings;

use App\Models\AuditLog;
use App\Models\Setting;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportSettingsAction
{
    public function execute(string $format = 'json'): StreamedResponse
    {
        $allSettings = Setting::all();
        $payload = [
            '_meta' => [
                'app' => 'BlockAuth',
                'schema_version' => 1,
                'exported_at' => now()->toIso8601String(),
            ],
            'settings' => [],
        ];

        foreach ($allSettings as $key => $val) {
            // Sanitasi rahasia kredensial agar aman diunduh
            if ($key === 'mail.password') {
                $val = '__REDACTED__';
            }

            if ($key === 'oauth.providers' && is_array($val)) {
                foreach ($val as &$p) {
                    if (isset($p['client_secret'])) {
                        $p['client_secret'] = '__REDACTED__';
                    }
                }
            }

            $payload['settings'][] = [
                'key' => $key,
                'value' => $val,
            ];
        }

        AuditLog::record('settings:backup', 'Mengunduh cadangan konfigurasi sistem (JSON)', [
            'format' => $format,
            'total_keys' => count($payload['settings']),
        ]);

        $filename = 'blockauth-settings-backup-' . now()->format('Y-m-d-His') . '.json';

        return response()->streamDownload(function () use ($payload) {
            echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }, $filename, [
            'Content-Type' => 'application/json; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
