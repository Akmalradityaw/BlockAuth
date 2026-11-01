<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class StoreOAuthProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('SuperAdmin') ?? false;
    }

    public function rules(): array
    {
        return [
            'provider_id' => ['required', 'string', 'alpha_dash', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'driver' => ['required', 'string', 'in:google,github,gitlab,bitbucket,slack,facebook'],
            'client_id' => ['required', 'string', 'max:255'],
            'client_secret' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'provider_id.required' => 'ID Provider wajib diisi.',
            'provider_id.alpha_dash' => 'ID Provider hanya boleh berisi huruf, angka, strip, dan garis bawah.',
            'name.required' => 'Nama tampilan provider wajib diisi.',
            'driver.required' => 'Driver OAuth wajib dipilih.',
            'driver.in' => 'Driver OAuth yang dipilih tidak didukung.',
            'client_id.required' => 'Client ID wajib diisi.',
            'client_secret.required' => 'Client Secret wajib diisi.',
        ];
    }
}

