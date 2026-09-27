<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Support\TwoFactorAuthenticator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TwoFactorController extends Controller
{
    /**
     * Inisialisasi pengaturan 2FA (kirim QR code dan secret key sementara).
     */
    public function setup(Request $request)
    {
        $user = $request->user();

        if ($user->hasTwoFactorEnabled()) {
            return response()->json([
                'enabled' => true,
            ]);
        }

        $secret = session('two_factor_setup_secret');
        if (! $secret) {
            $secret = TwoFactorAuthenticator::generateSecretKey(32);
            session(['two_factor_setup_secret' => $secret]);
        }

        $qrCodeUrl = TwoFactorAuthenticator::getQrCodeImageUrl('BlockAuth', $user->email, $secret);
        $otpauthUrl = TwoFactorAuthenticator::getOtpAuthUrl('BlockAuth', $user->email, $secret);

        return response()->json([
            'enabled' => false,
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'otpauth_url' => $otpauthUrl,
        ]);
    }

    /**
     * Konfirmasi kode 6 digit untuk mengaktifkan 2FA.
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $secret = session('two_factor_setup_secret');

        if (! $secret || ! TwoFactorAuthenticator::verifyCode($secret, $request->code)) {
            throw ValidationException::withMessages([
                'code' => ['Kode verifikasi 6-digit tidak valid atau sudah kedaluwarsa.'],
            ]);
        }

        $recoveryCodes = TwoFactorAuthenticator::generateRecoveryCodes(8);

        $user = $request->user();
        $user->two_factor_secret = $secret;
        $user->two_factor_recovery_codes = $recoveryCodes;
        $user->two_factor_confirmed_at = now();
        $user->save();

        session()->forget('two_factor_setup_secret');

        AuditLog::record('auth:2fa_enabled', 'Mengaktifkan autentikasi dua faktor (2FA) pada akun');

        return back()->with([
            'success' => 'Autentikasi dua faktor (2FA) berhasil diaktifkan.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    /**
     * Tampilkan kode pemulihan dengan verifikasi kata sandi.
     */
    public function recoveryCodes(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Kata sandi yang Anda masukkan salah.'],
            ]);
        }

        return response()->json([
            'recovery_codes' => $request->user()->two_factor_recovery_codes ?? [],
        ]);
    }

    /**
     * Buat ulang seluruh kode pemulihan.
     */
    public function regenerateRecoveryCodes(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Kata sandi yang Anda masukkan salah.'],
            ]);
        }

        $user = $request->user();
        $codes = TwoFactorAuthenticator::generateRecoveryCodes(8);
        $user->two_factor_recovery_codes = $codes;
        $user->save();

        AuditLog::record('auth:2fa_regenerate_codes', 'Memperbarui kode pemulihan darurat 2FA akun');

        return back()->with([
            'success' => 'Kode pemulihan darurat baru berhasil dibuat.',
            'recovery_codes' => $codes,
        ]);
    }

    /**
     * Nonaktifkan 2FA dengan verifikasi kata sandi.
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Kata sandi yang Anda masukkan salah.'],
            ]);
        }

        $user = $request->user();
        $user->two_factor_secret = null;
        $user->two_factor_recovery_codes = null;
        $user->two_factor_confirmed_at = null;
        $user->save();

        session()->forget('two_factor_setup_secret');

        AuditLog::record('auth:2fa_disabled', 'Menonaktifkan autentikasi dua faktor (2FA) pada akun');

        return back()->with('success', 'Autentikasi dua faktor berhasil dinonaktifkan.');
    }
}
