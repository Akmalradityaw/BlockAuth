<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class BulkActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', User::class);
    }

    public function rules(): array
    {
        return [
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['required', 'integer', 'exists:users,id'],
            'role' => ['sometimes', 'nullable', 'string', 'exists:roles,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_ids.required' => 'Pilih minimal satu pengguna untuk diproses.',
            'user_ids.min' => 'Pilih minimal satu pengguna untuk diproses.',
            'user_ids.*.exists' => 'Salah satu pengguna yang dipilih tidak valid.',
            'role.exists' => 'Peran yang dipilih tidak terdaftar di sistem.',
        ];
    }
}

