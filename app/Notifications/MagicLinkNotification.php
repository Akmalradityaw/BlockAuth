<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class MagicLinkNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $signedUrl = URL::temporarySignedRoute(
            'magic-link.verify',
            now()->addMinutes(15),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        return (new MailMessage)
            ->subject('Tautan Masuk Langsung (Magic Link) - BlockAuth')
            ->greeting("Halo, {$notifiable->name}!")
            ->line('Kami menerima permintaan untuk masuk ke akun BlockAuth Anda tanpa kata sandi.')
            ->action('Masuk Sekarang', $signedUrl)
            ->line('Tautan ini berlaku selama 15 menit dan hanya dapat digunakan sekali.')
            ->line('Jika Anda tidak meminta tautan ini, abaikan email ini. Akun Anda tetap aman.');
    }
}

