<?php

namespace App\Actions\Auth;

use App\Models\AuditLog;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthenticateUserAction
{
    public function execute(string $email, string $password): User
    {
        $throttleKey = Str::transliterate(Str::lower($email) . '|' . (request()?->ip() ?? '127.0.0.1'));
        $maxAttempts = (int) Setting::get('security.max_login_attempts', 5);
        $decayMinutes = (int) Setting::get('security.decay_minutes', 1);

        if (RateLimiter::tooManyAttempts($throttleKey, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            AuditLog::record('auth:lockout', 'Percobaan masuk dibatasi karena melebihi batas percobaan', [
                'email' => $email,
                'available_in_seconds' => $seconds,
            ]);

            throw ValidationException::withMessages([
                'email' => "Terlalu banyak percobaan masuk gagal. Silakan coba lagi dalam {$seconds} detik.",
            ]);
        }

        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            RateLimiter::hit($throttleKey, $decayMinutes * 60);

            AuditLog::record('auth:failed', 'Percobaan masuk gagal: kredensial tidak cocok', [
                'email' => $email,
            ]);

            throw ValidationException::withMessages([
                'email' => 'Kredensial yang diberikan tidak cocok dengan data kami.',
            ]);
        }

        RateLimiter::clear($throttleKey);

        return $user;
    }
}
