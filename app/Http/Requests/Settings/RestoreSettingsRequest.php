<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class RestoreSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('SuperAdmin');
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:2048', 'mimes:json,txt'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Berkas cadangan JSON wajib diunggah.',
            'file.max' => 'Ukuran berkas maksimal 2MB.',
            'file.mimes' => 'Berkas cadangan harus berupa format JSON.',
        ];
    }
}

