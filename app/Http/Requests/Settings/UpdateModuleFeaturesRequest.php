<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateModuleFeaturesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('SuperAdmin') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $merges = [];
        foreach (['users', 'roles', 'audit_logs', 'registration', 'magic_link', 'remove_logo'] as $key) {
            if ($this->has($key)) {
                $merges[$key] = filter_var($this->input($key), FILTER_VALIDATE_BOOLEAN);
            }
        }
        if ($merges) {
            $this->merge($merges);
        }
    }

    public function rules(): array
    {
        return [
            'users' => ['sometimes', 'boolean'],
            'roles' => ['sometimes', 'boolean'],
            'audit_logs' => ['sometimes', 'boolean'],
            'registration' => ['sometimes', 'boolean'],
            'magic_link' => ['sometimes', 'boolean'],
            'app_name' => ['nullable', 'string', 'max:60'],
            'app_tagline' => ['nullable', 'string', 'max:120'],
            'app_logo_url' => ['nullable', 'string', 'max:500'],
            'app_logo_file' => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,svg', 'max:2048'],
            'remove_logo' => ['sometimes', 'boolean'],
            'app_footer_text' => ['nullable', 'string', 'max:200'],
        ];
    }
}

