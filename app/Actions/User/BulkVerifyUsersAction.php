<?php

namespace App\Actions\User;

use App\Models\AuditLog;
use App\Models\User;

class BulkVerifyUsersAction
{
    public function execute(array $userIds): int
    {
        $count = User::whereIn('id', $userIds)
            ->whereNull('email_verified_at')
            ->update(['email_verified_at' => now()]);

        AuditLog::record('users:bulk_verify', "Memverifikasi email {$count} pengguna secara massal", [
            'verified_count' => $count,
            'user_ids' => $userIds,
        ]);

        return $count;
    }
}

