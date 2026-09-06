<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::factory()->count(12)->create();

        foreach ($users as $index => $user) {
            $user->assignRole('User');

            if ($index < 3) {
                $user->update(['email_verified_at' => null]);
            }
        }
    }
}
