<?php

namespace App\Actions\User;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class BulkDeleteUsersAction
{
    public function execute(array $userIds, User $actor): int
    {
        // 1. Saring agar tidak bisa menghapus akun sendiri
        $filteredIds = array_values(array_filter($userIds, fn ($id) => (int) $id !== (int) $actor->id));

        if (empty($filteredIds)) {
            throw new InvalidArgumentException('Tidak dapat menghapus akun Anda sendiri.');
        }

        // 2. Proteksi agar tidak menghapus seluruh SuperAdmin yang tersisa di sistem
        $totalSuperAdmins = User::role('SuperAdmin')->count();
        $targetSuperAdmins = User::role('SuperAdmin')->whereIn('id', $filteredIds)->count();

        if ($targetSuperAdmins >= $totalSuperAdmins) {
            throw new InvalidArgumentException('Penghapusan ditolak: Sistem harus menyisakan minimal 1 SuperAdmin aktif.');
        }

        $deletedCount = 0;
        DB::transaction(function () use ($filteredIds, &$deletedCount) {
            $deletedCount = User::whereIn('id', $filteredIds)->delete();
        });

        AuditLog::record('users:bulk_delete', "Menghapus {$deletedCount} pengguna secara massal", [
            'deleted_count' => $deletedCount,
            'target_ids' => $filteredIds,
        ]);

        return $deletedCount;
    }
}

