<?php

namespace App\Actions\Auth;

use App\Models\AuditLog;
use App\Models\User;
use App\Notifications\MagicLinkNotification;

class SendMagicLinkAction
{
    public function execute(string $email): bool
    {
        $user = User::where('email', $email)->first();

        if ($user) {
            $user->notify(new MagicLinkNotification());

            AuditLog::record(
                'auth:magic_link_sent',
                "Tautan login Magic Link dikirimkan ke {$user->email}",
                ['user_id' => $user->id],
                $user
            );
        }

        return true;
    }
}

