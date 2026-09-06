<?php

namespace App\Actions\Auth;

use App\DataTransferObjects\SocialiteData;
use App\Models\User;
use Illuminate\Support\Str;

class HandleSocialiteCallbackAction
{
    public function execute(SocialiteData $data): User
    {
        $user = User::where('provider', $data->provider)
            ->where('provider_id', $data->providerId)
            ->first();

        if ($user) {
            $user->update(['provider_token' => $data->token]);

            return $user;
        }

        $existing = User::where('email', $data->email)->first();

        if ($existing) {
            $existing->update([
                'provider' => $data->provider,
                'provider_id' => $data->providerId,
                'provider_token' => $data->token,
            ]);

            return $existing;
        }

        $created = User::create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => bcrypt(Str::random(32)),
            'provider' => $data->provider,
            'provider_id' => $data->providerId,
            'provider_token' => $data->token,
            'email_verified_at' => now(),
        ]);

        $created->assignRole('User');

        return $created;
    }
}
