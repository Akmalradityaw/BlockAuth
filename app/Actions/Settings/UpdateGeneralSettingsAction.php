<?php

namespace App\Actions\Settings;

use App\Models\AuditLog;
use App\Models\Setting;
use App\Models\User;

class UpdateGeneralSettingsAction
{
    /**
     * Perbarui status mode pemeliharaan (maintenance mode).
     */
    public function updateMaintenance(bool $enabled, ?User $user = null): void
    {
        Setting::set('maintenance.enabled', $enabled);

        AuditLog::record(
            'settings:maintenance',
            $enabled ? 'Mengaktifkan mode pemeliharaan sistem' : 'Menonaktifkan mode pemeliharaan sistem',
            ['maintenance' => $enabled],
            $user
        );
    }

    /**
     * Perbarui pengumuman banner siaran sistem.
     */
    public function updateBanner(array $data, ?User $user = null): void
    {
        $text = (string) ($data['text'] ?? '');
        $style = (string) ($data['style'] ?? 'warning');
        $enabled = (bool) ($data['enabled'] ?? false);

        Setting::set('banner.text', $text);
        Setting::set('banner.style', $style);
        Setting::set('banner.enabled', $enabled);

        AuditLog::record('settings:banner', 'Memperbarui pesan banner siaran sistem', [
            'text' => $text,
            'style' => $style,
            'enabled' => $enabled,
        ], $user);
    }
}

