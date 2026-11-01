<?php

namespace App\Actions\User;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Spatie\Permission\PermissionRegistrar;

class BulkAssignRoleAction
{
    public function execute(array $userIds, string $targetRole, User $actor): int
    {
        if (! Role::where('name', $targetRole)->exists()) {
            throw new InvalidArgumentException("Peran '{$targetRole}' tidak ditemukan di sistem.");
        }

        // 1. Jika mengubah role menjadi bukan SuperAdmin, cegah self-demotion
        $filteredIds = $userIds;
        if ($targetRole !== 'SuperAdmin') {
            $filteredIds = array_values(array_filter($userIds, fn ($id) => (int) $id !== (int) $actor->id));

            $totalSuperAdmins = User::role('SuperAdmin')->count();
            $targetSuperAdmins = User::role('SuperAdmin')->whereIn('id', $filteredIds)->count();

            if ($targetSuperAdmins >= $totalSuperAdmins) {
                throw new InvalidArgumentException('Aksi ditolak: Perubahan peran akan menyebabkan sistem tanpa SuperAdmin.');
            }
        }

        $affectedCount = 0;
        DB::transaction(function () use ($filteredIds, $targetRole, &$affectedCount) {
            $users = User::whereIn('id', $filteredIds)->get();
            foreach ($users as $user) {
                $user->syncRoles([$targetRole]);
                $affectedCount++;
            }
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        AuditLog::record('users:bulk_role', "Mengubah peran {$affectedCount} pengguna menjadi {$targetRole}", [
            'target_role' => $targetRole,
            'affected_count' => $affectedCount,
        ]);

        return $affectedCount;
    }
}

