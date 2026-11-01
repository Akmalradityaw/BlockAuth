<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSecurityPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('SuperAdmin') || $this->user()?->can('settings:manage');
    }

    public function rules(): array
    {
        return [
            'min_length' => ['required', 'integer', 'min:6', 'max:32'],
            'require_uppercase' => ['sometimes', 'boolean'],
            'require_numeric' => ['sometimes', 'boolean'],
            'require_special_char' => ['sometimes', 'boolean'],
            'check_pwned_passwords' => ['sometimes', 'boolean'],
            'must_verify_email' => ['sometimes', 'boolean'],
            'max_login_attempts' => ['required', 'integer', 'min:3', 'max:20'],
            'decay_minutes' => ['required', 'integer', 'min:1', 'max:60'],
        ];
    }

    public function messages(): array
    {
        return [
            'min_length.min' => 'Panjang sandi minimal 6 karakter.',
            'min_length.max' => 'Panjang sandi maksimal 32 karakter.',
            'max_login_attempts.min' => 'Batas percobaan login gagal minimal 3 kali.',
            'max_login_attempts.max' => 'Batas percobaan login gagal maksimal 20 kali.',
            'decay_minutes.min' => 'Durasi penangguhan minimal 1 menit.',
        ];
    }
}

