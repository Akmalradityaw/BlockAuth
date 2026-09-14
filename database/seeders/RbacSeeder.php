<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        // Matriks role -> permission + metadata.
        // Tambah resource baru: cukup tambah 1 baris permission per aksi.
        $roles = [
            'SuperAdmin' => [
                'label' => 'Super Admin',
                'description' => 'Pemilik sistem, akses penuh.',
                'permissions' => [
                    'users:create',
                    'users:read',
                    'users:update',
                    'users:delete',
                    'roles:manage',
                    'settings:read',
                    'settings:manage',
                ],
            ],
            'Manager' => [
                'label' => 'Manager',
                'description' => 'Pimpinan operasional, CRUD data bisnis.',
                'permissions' => ['users:create', 'users:read', 'users:update', 'users:delete'],
            ],
            'Editor' => [
                'label' => 'Editor',
                'description' => 'Spesialis data, tanpa hapus.',
                'permissions' => ['users:create', 'users:read', 'users:update'],
            ],
            'Staff' => [
                'label' => 'Staff',
                'description' => 'Operator input harian.',
                'permissions' => ['users:create', 'users:read'],
            ],
            'Viewer' => [
                'label' => 'Viewer',
                'description' => 'Auditor read-only.',
                'permissions' => ['users:read'],
            ],
        ];

        foreach ($roles as $name => $meta) {
            foreach ($meta['permissions'] as $perm) {
                Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            }

            Role::updateOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                [
                    'label' => $meta['label'],
                    'description' => $meta['description'],
                    'is_system' => true,
                ]
            )->syncPermissions($meta['permissions']);
        }

        // Migrasi role legacy "User" -> "Staff".
        if ($legacy = Role::where('name', 'User')->first()) {
            foreach ($legacy->users as $user) {
                $user->removeRole($legacy);
                $user->assignRole('Staff');
            }

            $legacy->delete();
        }

        User::where('email', 'admin@blockauth.test')->first()
            ?->assignRole('SuperAdmin');
    }
}
