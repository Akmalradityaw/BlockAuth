<?php

namespace App\Actions\Settings;

use App\Models\AuditLog;
use App\Models\Setting;

class UpdateSecurityPolicyAction
{
    public function execute(array $data): void
    {
        $passwordPolicy = [
            'min_length' => (int) ($data['min_length'] ?? 8),
            'require_uppercase' => (bool) ($data['require_uppercase'] ?? false),
            'require_numeric' => (bool) ($data['require_numeric'] ?? false),
            'require_special_char' => (bool) ($data['require_special_char'] ?? false),
            'check_pwned_passwords' => (bool) ($data['check_pwned_passwords'] ?? false),
        ];

        Setting::set('security.password_policy', $passwordPolicy);
        Setting::set('security.max_login_attempts', (int) ($data['max_login_attempts'] ?? 5));
        Setting::set('security.decay_minutes', (int) ($data['decay_minutes'] ?? 1));

        if (isset($data['must_verify_email'])) {
            Setting::set('auth.must_verify_email', (bool) $data['must_verify_email']);
        }

        AuditLog::record(
            'settings:security_updated',
            'Memperbarui kebijakan keamanan kata sandi dan brute force throttling',
            [
                'min_length' => $passwordPolicy['min_length'],
                'max_login_attempts' => $data['max_login_attempts'] ?? 5,
            ]
        );
    }
}

