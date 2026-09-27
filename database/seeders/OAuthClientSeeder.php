<?php

namespace Database\Seeders;

use App\Models\OAuthClient;
use App\Models\User;
use Illuminate\Database\Seeder;

class OAuthClientSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        if (! $admin) {
            return;
        }

        $clients = [
            [
                'name' => 'Internal Mobile Auth App',
                'client_id' => 'ba_client_mobile_app_prod',
                'client_secret' => 'ba_sec_8f93e2b1c4a567d890e1f2a3b4c5d6e7f8a9b0c1',
                'redirect_uri' => 'https://mobile.blockauth.internal/oauth/callback',
                'scopes' => ['profile', 'email'],
                'is_active' => true,
            ],
            [
                'name' => 'Data Analytics Dashboard',
                'client_id' => 'ba_client_analytics_dashboard',
                'client_secret' => 'ba_sec_1a2b3c4d5e6f7g8h9i0j',
                'redirect_uri' => 'https://analytics.blockauth.internal/callback',
                'scopes' => ['profile'],
                'is_active' => true,
            ],
            [
                'name' => 'Legacy CRM System',
                'client_id' => 'ba_client_legacy_crm',
                'client_secret' => 'ba_sec_legacy_9999999999',
                'redirect_uri' => 'https://crm.blockauth.internal/auth/callback',
                'scopes' => ['profile', 'email'],
                'is_active' => false,
            ]
        ];

        foreach ($clients as $client) {
            OAuthClient::firstOrCreate(
                ['client_id' => $client['client_id']],
                array_merge($client, ['user_id' => $admin->id])
            );
        }
    }
}
