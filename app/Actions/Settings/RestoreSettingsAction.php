<?php

namespace App\Actions\Settings;

use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use InvalidArgumentException;

class RestoreSettingsAction
{
    public function execute(UploadedFile $file): int
    {
        $content = file_get_contents($file->getPathname());
        $data = json_decode($content, true);

        if (! is_array($data) || ($data['_meta']['app'] ?? '') !== 'BlockAuth') {
            throw new InvalidArgumentException('Berkas cadangan tidak valid atau bukan berasal dari BlockAuth.');
        }

        $items = $data['settings'] ?? [];
        if (! is_array($items) || empty($items)) {
            throw new InvalidArgumentException('Tidak ada data pengaturan yang ditemukan di dalam berkas.');
        }

        $restoredCount = 0;

        foreach ($items as $item) {
            $key = $item['key'] ?? null;
            $incomingVal = $item['value'] ?? null;

            if (! $key) {
                continue;
            }

            // Smart Secret Preservation
            if ($key === 'mail.password' && $incomingVal === '__REDACTED__') {
                continue;
            }

            if ($key === 'oauth.providers' && is_array($incomingVal)) {
                $existingVal = Setting::get('oauth.providers', []);
                $existingSecrets = [];
                if (is_array($existingVal)) {
                    foreach ($existingVal as $ep) {
                        if (! empty($ep['id']) && ! empty($ep['client_secret'])) {
                            $existingSecrets[$ep['id']] = $ep['client_secret'];
                        }
                    }
                }

                foreach ($incomingVal as &$p) {
                    if (($p['client_secret'] ?? '') === '__REDACTED__' && isset($p['id']) && isset($existingSecrets[$p['id']])) {
                        $p['client_secret'] = $existingSecrets[$p['id']];
                    }
                }
            }

            Setting::set($key, $incomingVal);
            $restoredCount++;
        }

        AuditLog::record('settings:restore', "Memulihkan konfigurasi sistem dari berkas cadangan ({$restoredCount} pengaturan diperbarui)", [
            'file_name' => $file->getClientOriginalName(),
            'restored_keys_count' => $restoredCount,
        ]);

        return $restoredCount;
    }
}
