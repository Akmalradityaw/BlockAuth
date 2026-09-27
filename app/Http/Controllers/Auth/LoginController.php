<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\AuthenticateUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'authProviders' => $this->providers(),
        ]);
    }

    public function maintenance(): Response|\Illuminate\Http\RedirectResponse
    {
        if (! Setting::get('maintenance.enabled', false)) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/Login', [
            'authProviders' => $this->providers(),
            'isMaintenance' => true,
        ]);
    }

    public function store(LoginRequest $request, AuthenticateUserAction $action)
    {
        $data = $request->validated();

        $throttleKey = Str::transliterate(Str::lower($data['login']) . '|' . $request->ip());
        $maxAttempts = (int) Setting::get('auth.max_attempts', 5);
        $decayMinutes = (int) Setting::get('auth.decay_minutes', 1);
        $decaySeconds = max(1, $decayMinutes) * 60;

        if (RateLimiter::tooManyAttempts($throttleKey, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            AuditLog::record(
                'auth:lockout',
                "Akses masuk dikunci sementara akibat terdeteksi {$maxAttempts} kali kegagalan login",
                [
                    'login' => $data['login'],
                    'ip' => $request->ip(),
                    'lockout_seconds' => $seconds,
                ]
            );

            throw ValidationException::withMessages([
                'login' => "Terlalu banyak percobaan masuk yang gagal. Akses dikunci sementara demi keamanan. Silakan coba lagi dalam {$seconds} detik.",
            ]);
        }

        try {
            $action->execute(
                $data['login'],
                $data['password'],
                (bool) ($data['remember'] ?? false)
            );
        } catch (ValidationException $e) {
            RateLimiter::hit($throttleKey, $decaySeconds);
            $attemptsMade = RateLimiter::attempts($throttleKey);
            $remaining = $maxAttempts - $attemptsMade;

            if ($remaining > 0 && $remaining <= 2) {
                throw ValidationException::withMessages([
                    'login' => "Kredensial yang diberikan tidak cocok. Peringatan keamanan: Sisa percobaan masuk Anda adalah {$remaining} kali sebelum akun/IP dikunci.",
                ]);
            }

            throw $e;
        }

        RateLimiter::clear($throttleKey);

        $user = $request->user();

        if ($user && $user->hasTwoFactorEnabled()) {
            $userId = $user->id;
            $remember = (bool) ($data['remember'] ?? false);

            Auth::guard('web')->logout();
            $request->session()->put('login.2fa.user_id', $userId);
            $request->session()->put('login.2fa.remember', $remember);

            return redirect()->route('two-factor.challenge');
        }

        $request->session()->regenerate();

        return redirect()
            ->intended(route('dashboard'))
            ->with('success', 'Selamat datang kembali!');
    }

    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('login')
            ->with('info', 'Anda telah keluar dari akun.');
    }

    protected function providers(): array
    {
        return [
            'google' => Setting::get('auth.google'),
            'github' => Setting::get('auth.github'),
        ];
    }
}
