<?php

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateUserAction
{
    /**
     * Buat akun pengguna baru dari form admin.
     *
     * @param array $data
     * @return User
     */
    public function execute(array $data): User
    {
        $user = new User([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'bio' => $data['bio'] ?? null,
        ]);

        if (!empty($data['verified'])) {
            $user->email_verified_at = now();
        }

        $user->save();

        $role = $data['role'] ?? 'Staff';
        $user->assignRole($role);

        return $user;
    }
}
