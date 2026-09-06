<?php

namespace App\Actions\Profile;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdateUserPasswordAction
{
    public function execute(User $user, string $newPassword): void
    {
        $user->update([
            'password' => Hash::make($newPassword),
        ]);
    }
}
