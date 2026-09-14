<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $viewer): bool
    {
        return $viewer->can('users:read');
    }

    public function update(User $viewer, User $target): bool
    {
        return $viewer->id === $target->id || $viewer->isSuperAdmin();
    }

    public function view(User $viewer, User $target): bool
    {
        return $viewer->id === $target->id || $viewer->isSuperAdmin();
    }
}
