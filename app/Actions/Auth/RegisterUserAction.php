<?php

namespace App\Actions\Auth;

use App\DataTransferObjects\Auth\RegisterData;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RegisterUserAction
{
    public function execute(RegisterData $data): User
    {
        $user = User::create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => Hash::make($data->password),
        ]);

        $defaultRole = \App\Models\Role::where('name', 'Viewer')->exists()
            ? 'Viewer'
            : (\App\Models\Role::where('name', 'User')->exists() ? 'User' : null);

        if ($defaultRole) {
            $user->assignRole($defaultRole);
        }

        return $user;
    }
}
