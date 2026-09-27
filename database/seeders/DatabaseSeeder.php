<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            RbacSeeder::class,
            UserSeeder::class,
            EmailTemplateSeeder::class,
            AccessPolicySeeder::class,
            OrganizationSeeder::class,
            OAuthClientSeeder::class,
            SecurityTicketSeeder::class,
        ]);
    }
}
