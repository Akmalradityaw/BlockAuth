<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOAuthProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('SuperAdmin') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'driver' => ['required', 'string', 'in:google,github,gitlab,bitbucket,slack,facebook'],
            'client_id' => ['required', 'string', 'max:255'],
            'client_secret' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama tampilan provider wajib diisi.',
            'driver.required' => 'Driver OAuth wajib dipilih.',
            'driver.in' => 'Driver OAuth yang dipilih tidak didukung.',
            'client_id.required' => 'Client ID wajib diisi.',
        ];
    }
}

