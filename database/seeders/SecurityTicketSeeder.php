<?php

namespace Database\Seeders;

use App\Models\SecurityTicket;
use App\Models\TicketReply;
use App\Models\User;
use Illuminate\Database\Seeder;

class SecurityTicketSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        if (! $admin) {
            return;
        }

        $tickets = [
            [
                'ticket_number' => 'SEC-891042',
                'category' => '2fa_reset',
                'priority' => 'high',
                'status' => 'open',
                'subject' => 'Permohonan Reset Perangkat 2FA (Ponsel Hilang)',
                'description' => 'Pengguna kehilangan ponsel cerdas yang berisi aplikasi Google Authenticator dan meminta verifikasi identitas manual untuk pemulihan akun.',
                'replies' => [
                    ['message' => 'Laporan telah diterima. Tim verifikasi keamanan sedang memeriksa riwayat dokumen KYC dan log sesi login terakhir pengguna.', 'is_internal' => true]
                ]
            ],
            [
                'ticket_number' => 'SEC-891043',
                'category' => 'ip_appeal',
                'priority' => 'medium',
                'status' => 'in_progress',
                'subject' => 'Sanggahan Pemblokiran IP Kantor',
                'description' => 'IP kantor kami terblokir setelah ada karyawan yang salah memasukkan kata sandi beberapa kali.',
                'replies' => [
                    ['message' => 'Mohon infokan alamat IP statis kantor Anda agar kami dapat meninjaunya.', 'is_internal' => false]
                ]
            ],
            [
                'ticket_number' => 'SEC-891044',
                'category' => 'suspicious_activity',
                'priority' => 'critical',
                'status' => 'resolved',
                'subject' => 'Login Mencurigakan dari Negara Lain',
                'description' => 'Saya menerima email login dari Rusia, padahal saya sedang di Indonesia.',
                'replies' => [
                    ['message' => 'Sesi login dari luar negeri telah kami matikan secara paksa. Harap segera mengganti kata sandi Anda.', 'is_internal' => false],
                    ['message' => 'Tandai aktivitas ini sebagai anomali di sistem.', 'is_internal' => true]
                ]
            ]
        ];

        foreach ($tickets as $ticketData) {
            $replies = $ticketData['replies'];
            unset($ticketData['replies']);

            $ticket = SecurityTicket::firstOrCreate(
                ['ticket_number' => $ticketData['ticket_number']],
                array_merge($ticketData, [
                    'user_id' => $admin->id,
                    'assigned_to' => $admin->id
                ])
            );

            foreach ($replies as $reply) {
                TicketReply::firstOrCreate(
                    ['ticket_id' => $ticket->id, 'message' => $reply['message']],
                    ['user_id' => $admin->id, 'is_internal' => $reply['is_internal']]
                );
            }
        }
    }
}
