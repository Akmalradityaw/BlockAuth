<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGeneralSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('SuperAdmin') || $this->user()?->can('settings:manage');
    }

    public function rules(): array
    {
        return [
            'maintenance' => ['sometimes', 'boolean'],
            'enabled' => ['sometimes', 'boolean'],
            'text' => ['nullable', 'string', 'max:200'],
            'style' => ['sometimes', 'string', 'in:info,warning,critical'],
        ];
    }
}

