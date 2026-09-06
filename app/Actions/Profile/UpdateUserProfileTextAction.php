<?php

namespace App\Actions\Profile;

use App\DataTransferObjects\UpdateProfileData;
use App\Models\User;

class UpdateUserProfileTextAction
{
    public function execute(User $user, UpdateProfileData $data): User
    {
        $user->update([
            'name' => $data->name,
            'email' => $data->email,
            'bio' => $data->bio,
        ]);

        if ($user->wasChanged('email')) {
            $user->update(['email_verified_at' => null]);
        }

        return $user->refresh();
    }
}
