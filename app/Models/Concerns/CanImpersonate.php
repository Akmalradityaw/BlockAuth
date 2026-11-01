<?php

namespace App\Models\Concerns;

use App\Models\User;

trait CanImpersonate
{
    public function canImpersonate(): bool
    {
        return $this->isSuperAdmin();
    }

    public function canBeImpersonated(): bool
    {
        return ! $this->isSuperAdmin();
    }

    public function isImpersonating(): bool
    {
        return session()->has('impersonator_id');
    }

    public function getImpersonator(): ?User
    {
        $impersonatorId = session('impersonator_id');

        if (! $impersonatorId) {
            return null;
        }

        return User::find($impersonatorId);
    }
}

