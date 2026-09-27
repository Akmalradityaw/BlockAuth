<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\TwoFactorAuthenticator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        if (! $request->session()->has('login.2fa.user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function store(Request $request)
    {
        if (! $request->session()->has('login.2fa.user_id')) {
            return redirect()->route('login');
        }

        $user = User::findOrFail($request->session()->get('login.2fa.user_id'));
        $remember = (bool) $request->session()->get('login.2fa.remember', false);

        // Opsi 1: Verifikasi via TOTP 6-digit code
        if ($request->filled('code')) {
            $code = trim($request->code);

            if (! TwoFactorAuthenticator::verifyCode($user->two_factor_secret, $code)) {
                AuditLog::record('auth:2fa_failed', 'Gagal memverifikasi kode 2FA Authenticator saat login', null, $user);

                throw ValidationException::withMessages([
                    'code' => ['Kode autentikasi tidak valid atau telah kedaluwarsa.'],
                ]);
            }

            Auth::login($user, $remember);
            $request->session()->forget(['login.2fa.user_id', 'login.2fa.remember']);
            $request->session()->regenerate();

            AuditLog::record('auth:login', 'Berhasil masuk ke sistem via 2FA TOTP', ['method' => 'totp'], $user);

            return redirect()->intended(route('dashboard'))->with('success', 'Verifikasi 2FA berhasil. Selamat datang kembali!');
        }

        // Opsi 2: Verifikasi via Recovery Code
        if ($request->filled('recovery_code')) {
            $recoveryInput = strtoupper(trim($request->recovery_code));
            $codes = $user->two_factor_recovery_codes ?? [];

            $foundIndex = array_search($recoveryInput, $codes, true);

            if ($foundIndex === false) {
                AuditLog::record('auth:2fa_failed', 'Gagal memverifikasi kode pemulihan darurat saat login', null, $user);

                throw ValidationException::withMessages([
                    'recovery_code' => ['Kode pemulihan darurat tidak valid.'],
                ]);
            }

            // Hapus kode yang telah dipakai agar tidak bisa digunakan lagi
            unset($codes[$foundIndex]);
            $user->two_factor_recovery_codes = array_values($codes);
            $user->save();

            Auth::login($user, $remember);
            $request->session()->forget(['login.2fa.user_id', 'login.2fa.remember']);
            $request->session()->regenerate();

            AuditLog::record('auth:login', 'Berhasil masuk ke sistem via kode pemulihan darurat 2FA', ['method' => 'recovery_code'], $user);

            return redirect()->intended(route('dashboard'))->with(
                'info',
                'Anda berhasil masuk menggunakan kode pemulihan darurat. Sisa kode pemulihan: ' . count($codes) . '.'
            );
        }

        throw ValidationException::withMessages([
            'code' => ['Harap masukkan kode autentikasi atau kode pemulihan darurat.'],
        ]);
    }
}
