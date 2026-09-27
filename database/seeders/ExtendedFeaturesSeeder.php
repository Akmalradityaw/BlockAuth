<?php

namespace Database\Seeders;

use App\Models\AccessPolicy;
use App\Models\EmailTemplate;
use App\Models\OAuthClient;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\SecurityTicket;
use App\Models\TicketReply;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExtendedFeaturesSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        if (! $admin) {
            return;
        }

        // 1. Template Email Sistem Default
        $templates = [
            [
                'code' => 'email_verification',
                'name' => 'Verifikasi Alamat Email',
                'subject' => 'Verifikasi Alamat Email Anda - BlockAuth',
                'body' => "Halo {{user_name}},\n\nTerima kasih telah mendaftar di sistem kami. Silakan klik tautan di bawah ini untuk memverifikasi alamat email Anda:\n\n{{action_url}}\n\nTautan ini hanya berlaku selama 60 menit. Jika Anda tidak merasa mendaftar, abaikan email ini.\n\nSalam,\nTim Keamanan BlockAuth",
                'variables' => ['user_name', 'action_url'],
                'is_active' => true,
            ],
            [
                'code' => 'password_reset',
                'name' => 'Pemulihan Kata Sandi',
                'subject' => 'Permintaan Reset Kata Sandi Akun Anda',
                'body' => "Halo {{user_name}},\n\nKami menerima permintaan untuk mereset kata sandi akun Anda. Anda dapat mengatur ulang kata sandi melalui tautan berikut:\n\n{{action_url}}\n\nJika Anda tidak meminta pengaturan ulang sandi, segera amankan akun Anda.\n\nSalam,\nTim Keamanan BlockAuth",
                'variables' => ['user_name', 'action_url'],
                'is_active' => true,
            ],
            [
                'code' => 'new_device_login',
                'name' => 'Peringatan Login Perangkat Baru',
                'subject' => 'Peringatan Keamanan: Login dari Perangkat Baru',
                'body' => "Halo {{user_name}},\n\nAkun Anda baru saja terdeteksi masuk dari perangkat yang belum pernah digunakan sebelumnya:\n\n- Waktu: {{login_time}}\n- Alamat IP: {{ip_address}}\n- Perangkat/Browser: {{device_name}}\n\nJika ini bukan aktivitas Anda, segera putuskan sesi dan ubah kata sandi di {{action_url}}.\n\nSalam,\nSistem Proteksi BlockAuth",
                'variables' => ['user_name', 'login_time', 'ip_address', 'device_name', 'action_url'],
                'is_active' => true,
            ],
            [
                'code' => 'account_lockout',
                'name' => 'Pemberitahuan Akun Terkunci (Brute Force)',
                'subject' => 'Akun Anda Telah Dikunci Sementara',
                'body' => "Halo {{user_name}},\n\nSistem proteksi otomatis kami mendeteksi percobaan login gagal berulang kali ke akun Anda. Akun Anda telah dikunci sementara selama {{decay_minutes}} menit untuk mencegah serangan brute force.\n\nAlamat IP pemicu: {{ip_address}}\n\nSalam,\nTim Keamanan BlockAuth",
                'variables' => ['user_name', 'decay_minutes', 'ip_address'],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $tmpl) {
            EmailTemplate::updateOrCreate(['code' => $tmpl['code']], $tmpl);
        }

        // 2. Kebijakan Akses Contoh
        AccessPolicy::firstOrCreate(
            ['name' => 'Blokir Lalu Lintas Tor & Proxy Publik'],
            [
                'type' => 'connection_security',
                'action' => 'block',
                'rules' => ['block_anonymous_proxy' => true, 'block_tor_exit_nodes' => true],
                'is_active' => true,
                'description' => 'Mencegah percobaan autentikasi dari node keluar Tor dan proxy anonim.',
                'created_by' => $admin->id,
            ]
        );

        AccessPolicy::firstOrCreate(
            ['name' => 'Pembatasan Geografis Wilayah Berisiko Tinggi'],
            [
                'type' => 'geofencing',
                'action' => 'block',
                'rules' => ['blocked_countries' => ['KP', 'IR', 'SY']],
                'is_active' => true,
                'description' => 'Blokir akses masuk dari negara-negara dalam daftar sanksi dan embargo siber.',
                'created_by' => $admin->id,
            ]
        );

        // 3. Organisasi Contoh
        $org = Organization::firstOrCreate(
            ['slug' => 'acme-cyber-defense'],
            [
                'name' => 'Acme Cyber Defense',
                'description' => 'Divisi keamanan informasi dan pusat operasi siber perusahaan.',
                'owner_id' => $admin->id,
                'is_active' => true,
                'max_members' => 100,
            ]
        );

        OrganizationMember::firstOrCreate(
            ['organization_id' => $org->id, 'user_id' => $admin->id],
            ['role' => 'owner']
        );

        // 4. Klien OAuth Contoh
        OAuthClient::firstOrCreate(
            ['name' => 'Internal Mobile Auth App'],
            [
                'user_id' => $admin->id,
                'client_id' => 'ba_client_mobile_app_prod',
                'client_secret' => 'ba_sec_8f93e2b1c4a567d890e1f2a3b4c5d6e7f8a9b0c1',
                'redirect_uri' => 'https://mobile.blockauth.internal/oauth/callback',
                'scopes' => ['profile', 'email'],
                'is_active' => true,
            ]
        );

        // 5. Tiket Keamanan Contoh
        $ticket = SecurityTicket::firstOrCreate(
            ['ticket_number' => 'SEC-891042'],
            [
                'user_id' => $admin->id,
                'assigned_to' => $admin->id,
                'category' => '2fa_reset',
                'priority' => 'high',
                'status' => 'open',
                'subject' => 'Permohonan Reset Perangkat 2FA (Ponsel Hilang)',
                'description' => 'Pengguna kehilangan ponsel cerdas yang berisi aplikasi Google Authenticator dan meminta verifikasi identitas manual untuk pemulihan akun.',
            ]
        );

        TicketReply::firstOrCreate(
            ['ticket_id' => $ticket->id, 'message' => 'Laporan telah diterima. Tim verifikasi keamanan sedang memeriksa riwayat dokumen KYC dan log sesi login terakhir pengguna.'],
            ['user_id' => $admin->id, 'is_internal' => true]
        );
    }
}
