<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        if (! $admin) {
            return;
        }

        $organizations = [
            [
                'name' => 'Acme Cyber Defense',
                'description' => 'Divisi keamanan informasi dan pusat operasi siber perusahaan.',
                'max_members' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Stark Industries',
                'description' => 'Departemen R&D untuk teknologi pertahanan.',
                'max_members' => 50,
                'is_active' => true,
            ],
            [
                'name' => 'Wayne Enterprises',
                'description' => 'Divisi logistik dan operasi global.',
                'max_members' => 200,
                'is_active' => false,
            ]
        ];

        foreach ($organizations as $orgData) {
            $org = Organization::firstOrCreate(
                ['slug' => Str::slug($orgData['name'])],
                array_merge($orgData, ['owner_id' => $admin->id])
            );

            OrganizationMember::firstOrCreate(
                ['organization_id' => $org->id, 'user_id' => $admin->id],
                ['role' => 'owner']
            );
        }
    }
}
