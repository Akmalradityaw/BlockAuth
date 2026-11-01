<?php

namespace App\Actions\Settings;

use App\Models\AuditLog;
use App\Models\Setting;
use App\Models\User;

class ManageOAuthProviderAction
{
    public function create(array $data, ?User $user = null): void
    {
        $id = strtolower(trim($data['provider_id']));

        Setting::saveOAuthProvider($id, [
            'name' => trim($data['name']),
            'driver' => $data['driver'],
            'client_id' => trim($data['client_id']),
            'client_secret' => $data['client_secret'] ?? '',
            'is_active' => (bool) ($data['is_active'] ?? false),
        ]);

        AuditLog::record(
            'settings:oauth_provider_created',
            "Menambahkan provider OAuth baru: {$data['name']} ({$id})",
            ['provider_id' => $id, 'driver' => $data['driver']],
            $user
        );
    }

    public function update(string $id, array $data, ?User $user = null): void
    {
        Setting::saveOAuthProvider($id, [
            'name' => trim($data['name']),
            'driver' => $data['driver'],
            'client_id' => trim($data['client_id']),
            'client_secret' => $data['client_secret'] ?? '',
            'is_active' => (bool) ($data['is_active'] ?? false),
        ]);

        AuditLog::record(
            'settings:oauth_provider_updated',
            "Memperbarui provider OAuth: {$data['name']} ({$id})",
            ['provider_id' => $id, 'driver' => $data['driver']],
            $user
        );
    }

    public function toggle(string $id, ?User $user = null): bool
    {
        $state = Setting::toggleOAuthProvider($id);

        $stateText = $state ? 'diaktifkan' : 'dinonaktifkan';
        AuditLog::record(
            'settings:oauth_provider_toggled',
            "Status provider OAuth {$id} {$stateText}",
            ['provider_id' => $id, 'is_active' => $state],
            $user
        );

        return $state;
    }

    public function delete(string $id, ?User $user = null): void
    {
        Setting::deleteOAuthProvider($id);

        AuditLog::record(
            'settings:oauth_provider_deleted',
            "Menghapus provider OAuth: {$id}",
            ['provider_id' => $id],
            $user
        );
    }
}

