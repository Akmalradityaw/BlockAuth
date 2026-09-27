<?php

namespace Database\Seeders;

use App\Models\AccessPolicy;
use App\Models\User;
use Illuminate\Database\Seeder;

class AccessPolicySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        if (! $admin) {
            return;
        }

        $policies = [
            [
                'name' => 'Blokir Lalu Lintas Tor & Proxy Publik',
                'type' => 'connection_security',
                'action' => 'block',
                'rules' => ['block_anonymous_proxy' => true, 'block_tor_exit_nodes' => true],
                'is_active' => true,
                'description' => 'Mencegah percobaan autentikasi dari node keluar Tor dan proxy anonim.',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Pembatasan Geografis Wilayah Berisiko Tinggi',
                'type' => 'geofencing',
                'action' => 'block',
                'rules' => ['blocked_countries' => ['KP', 'IR', 'SY', 'RU']],
                'is_active' => true,
                'description' => 'Blokir akses masuk dari negara-negara dalam daftar sanksi dan embargo siber.',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Jam Operasional Standar (WIB)',
                'type' => 'time_restriction',
                'action' => 'allow',
                'rules' => ['start_time' => '07:00', 'end_time' => '19:00'],
                'is_active' => false,
                'description' => 'Mengizinkan login hanya pada jam kerja (Contoh kebijakan tidak aktif).',
                'created_by' => $admin->id,
            ]
        ];

        foreach ($policies as $policy) {
            AccessPolicy::firstOrCreate(['name' => $policy['name']], $policy);
        }
    }
}
