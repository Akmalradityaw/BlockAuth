<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class ImportUsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:5120', // Maksimal 5MB
                'mimes:csv,txt,json,sql,md,docx,html,htm,xlsx',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Berkas impor wajib diunggah.',
            'file.max' => 'Ukuran berkas maksimal adalah 5MB.',
            'file.mimes' => 'Format berkas harus berupa .csv, .xlsx, .docx, .json, .sql, .md, atau .txt.',
        ];
    }
}

