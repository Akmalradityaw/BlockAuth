<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
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
            [
                'code' => 'welcome_email',
                'name' => 'Sambutan Pengguna Baru',
                'subject' => 'Selamat Datang di BlockAuth!',
                'body' => "Halo {{user_name}},\n\nSelamat bergabung! Akun Anda telah berhasil dibuat. Silakan jelajahi fitur-fitur keamanan kami.\n\nSalam,\nTim BlockAuth",
                'variables' => ['user_name'],
                'is_active' => true,
            ],
            [
                'code' => 'role_updated',
                'name' => 'Pemberitahuan Perubahan Hak Akses',
                'subject' => 'Pembaruan Hak Akses Akun',
                'body' => "Halo {{user_name}},\n\nHak akses akun Anda telah diperbarui oleh administrator. Anda sekarang memiliki peran: {{roles}}.\n\nSalam,\nTim Keamanan BlockAuth",
                'variables' => ['user_name', 'roles'],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $tmpl) {
            EmailTemplate::updateOrCreate(['code' => $tmpl['code']], $tmpl);
        }
    }
}
