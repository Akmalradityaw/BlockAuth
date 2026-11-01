<?php

namespace App\Actions\User;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ImpersonateUserAction
{
    public function execute(User $impersonator, User $target): User
    {
        if (! $impersonator->canImpersonate()) {
            throw ValidationException::withMessages([
                'user' => ['Hanya SuperAdmin yang diizinkan melakukan impersonasi.'],
            ]);
        }

        if ($impersonator->id === $target->id) {
            throw ValidationException::withMessages([
                'user' => ['Anda tidak dapat meng-impersonasi akun Anda sendiri.'],
            ]);
        }

        if (! $target->canBeImpersonated()) {
            throw ValidationException::withMessages([
                'user' => ['Tidak diizinkan meng-impersonasi sesama SuperAdmin demi alasan keamanan.'],
            ]);
        }

        session(['impersonator_id' => $impersonator->id]);

        Auth::login($target);

        AuditLog::record(
            'user:impersonate_start',
            "SuperAdmin {$impersonator->name} ({$impersonator->email}) memulai impersonasi sebagai {$target->name} ({$target->email})",
            [
                'impersonator_id' => $impersonator->id,
                'target_id' => $target->id,
            ],
            $target
        );

        return $target;
    }
}

