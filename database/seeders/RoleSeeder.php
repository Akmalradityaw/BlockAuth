<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Role SuperAdmin wajib ada lebih dulu sebelum dipakai di seeder lain.
        $superAdmin = Role::firstOrCreate(
            ['name' => 'SuperAdmin', 'guard_name' => 'web'],
            [
                'label' => 'Super Admin',
                'description' => 'Pemilik sistem, akses penuh.',
                'is_system' => true,
            ]
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@blockauth.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'bio' => 'Akun administrator utama.',
            ]
        );

        $admin->assignRole($superAdmin);
    }
}
