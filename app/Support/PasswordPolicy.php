<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Validation\Rules\Password;

class PasswordPolicy
{
    /**
     * Dapatkan konfigurasi kebijakan password saat ini.
     */
    public static function get(): array
    {
        return [
            'min_length' => (int) Setting::get('password_policy.min_length', 8),
            'require_uppercase' => (bool) Setting::get('password_policy.require_uppercase', true),
            'require_numeric' => (bool) Setting::get('password_policy.require_numeric', true),
            'require_special_char' => (bool) Setting::get('password_policy.require_special_char', false),
        ];
    }

    /**
     * Dapatkan instance Illuminate\Validation\Rules\Password sesuai kebijakan aktif.
     */
    public static function rule(): Password
    {
        $policy = self::get();

        $rule = Password::min(max(6, $policy['min_length']));

        if ($policy['require_uppercase']) {
            $rule->mixedCase();
        }

        if ($policy['require_numeric']) {
            $rule->numbers();
        }

        if ($policy['require_special_char']) {
            $rule->symbols();
        }

        return $rule;
    }
}
