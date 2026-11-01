<?php

namespace App\Actions\User;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class StopImpersonationAction
{
    public function execute(): User
    {
        $impersonatorId = session('impersonator_id');

        if (! $impersonatorId) {
            throw ValidationException::withMessages([
                'session' => ['Tidak ada sesi impersonasi yang sedang aktif.'],
            ]);
        }

        $impersonator = User::findOrFail($impersonatorId);
        $target = Auth::user();

        session()->forget('impersonator_id');

        Auth::login($impersonator);

        AuditLog::record(
            'user:impersonate_stop',
            "SuperAdmin {$impersonator->name} mengakhiri impersonasi atas {$target?->name}.",
            [
                'impersonator_id' => $impersonator->id,
                'target_id' => $target?->id,
            ],
            $impersonator
        );

        return $impersonator;
    }
}

