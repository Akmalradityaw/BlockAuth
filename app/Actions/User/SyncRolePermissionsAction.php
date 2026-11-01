<?php

namespace App\Actions\User;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;

class SyncRolePermissionsAction
{
    /**
     * Sinkronkan matriks permissions untuk daftar peran.
     */
    public function execute(array $matrix, ?User $actor = null): void
    {
        foreach ($matrix as $roleId => $perms) {
            Role::findOrFail($roleId)->syncPermissions($perms);
        }

        AuditLog::record(
            'roles:permissions_updated',
            'Memperbarui matriks hak akses dan izin peran sistem',
            ['roles_count' => count($matrix)],
            $actor
        );
    }
}

