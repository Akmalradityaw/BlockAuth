<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;

class MailConfigurator
{
    public static function configure(): void
    {
        $host = Setting::get('mail.host');

        if (empty($host)) {
            return;
        }

        $port = (int) Setting::get('mail.port', 587);
        $encryption = Setting::get('mail.encryption', 'tls');
        $username = Setting::get('mail.username');
        $password = Setting::getEncrypted('mail.password');
        $fromAddress = Setting::get('mail.from_address');
        $fromName = Setting::get('mail.from_name', Setting::get('app.name', 'BlockAuth'));

        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.host', $host);
        Config::set('mail.mailers.smtp.port', $port);
        Config::set('mail.mailers.smtp.encryption', $encryption === 'none' ? null : $encryption);
        Config::set('mail.mailers.smtp.username', $username);
        Config::set('mail.mailers.smtp.password', $password);

        if (! empty($fromAddress)) {
            Config::set('mail.from.address', $fromAddress);
            Config::set('mail.from.name', $fromName);
        }
    }
}

