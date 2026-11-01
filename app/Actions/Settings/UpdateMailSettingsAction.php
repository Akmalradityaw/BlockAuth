<?php

namespace App\Actions\Settings;

use App\Models\AuditLog;
use App\Models\Setting;
use App\Support\MailConfigurator;

class UpdateMailSettingsAction
{
    public function execute(array $data): void
    {
        Setting::set('mail.host', $data['host']);
        Setting::set('mail.port', (int) $data['port']);
        Setting::set('mail.encryption', $data['encryption']);
        Setting::set('mail.username', $data['username'] ?? '');

        if (! empty($data['password'])) {
            Setting::setEncrypted('mail.password', $data['password']);
        }

        Setting::set('mail.from_address', $data['from_address']);
        Setting::set('mail.from_name', $data['from_name']);

        MailConfigurator::configure();

        AuditLog::record(
            'settings:mail_updated',
            "Memperbarui konfigurasi server SMTP ({$data['host']}:{$data['port']})",
            [
                'host' => $data['host'],
                'port' => $data['port'],
                'encryption' => $data['encryption'],
                'from_address' => $data['from_address'],
            ]
        );
    }
}

