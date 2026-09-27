<?php

namespace App\Providers;

use App\Models\AuditLog;
use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);

        Event::listen(Login::class, function (Login $event) {
            AuditLog::record('auth:login', 'Berhasil masuk ke dalam sistem', [
                'guard' => $event->guard,
            ], $event->user instanceof User ? $event->user : null);

            if ($event->user instanceof User) {
                \App\Models\KnownDevice::checkAndRecord($event->user);
            }
        });

        Event::listen(Logout::class, function (Logout $event) {
            if ($event->user instanceof User) {
                AuditLog::record('auth:logout', 'Keluar dari sistem (logout)', [
                    'guard' => $event->guard,
                ], $event->user);
            }
        });

        Event::listen(Failed::class, function (Failed $event) {
            $email = $event->credentials['email'] ?? 'Tidak diketahui';
            AuditLog::record('auth:failed', "Percobaan masuk gagal untuk email: {$email}", [
                'email' => $email,
            ], $event->user instanceof User ? $event->user : null);
        });
    }
}
