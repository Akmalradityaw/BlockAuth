<?php

namespace App\Actions\Settings;

use App\Support\MailConfigurator;
use Illuminate\Support\Facades\Mail;
use Throwable;

class TestMailConnectionAction
{
    public function execute(string $recipientEmail): array
    {
        MailConfigurator::configure();

        try {
            Mail::raw(
                "Halo,\n\nIni adalah email percobaan dari BlockAuth untuk memverifikasi bahwa konfigurasi server SMTP Anda telah terhubung dan berfungsi dengan baik.\n\nWaktu kirim: " . now()->toRfc2822String() . "\n\nSalam,\nTim BlockAuth",
                function ($message) use ($recipientEmail) {
                    $message->to($recipientEmail)
                        ->subject('Uji Koneksi Server Email (SMTP) BlockAuth');
                }
            );

            return [
                'success' => true,
                'message' => "Email percobaan berhasil dikirim ke {$recipientEmail}. Silakan periksa kotak masuk (inbox) Anda.",
            ];
        } catch (Throwable $e) {
            return [
                'success' => false,
                'message' => 'Gagal mengirim email: ' . $e->getMessage(),
            ];
        }
    }
}

