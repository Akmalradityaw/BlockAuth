<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $viewer): bool
    {
        return $viewer->can('users:read');
    }

    public function create(User $viewer): bool
    {
        return $viewer->can('users:create');
    }

    public function updateAny(User $viewer): bool
    {
        return $viewer->can('users:update');
    }

    public function deleteAny(User $viewer): bool
    {
        return $viewer->can('users:delete');
    }

    public function update(User $viewer, User $target): bool
    {
        return $viewer->id === $target->id || $viewer->can('users:update');
    }

    public function delete(User $viewer, User $target): bool
    {
        return $viewer->id !== $target->id && $viewer->can('users:delete');
    }

    public function view(User $viewer, User $target): bool
    {
        return $viewer->id === $target->id || $viewer->can('users:read');
    }
}
