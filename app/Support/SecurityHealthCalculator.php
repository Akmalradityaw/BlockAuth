<?php

namespace App\Support;

use App\Models\Setting;
use App\Models\User;

class SecurityHealthCalculator
{
    public static function calculate(): array
    {
        $policy = Setting::getGroup('security');
        $checkPwned = ! empty($policy['check_pwned_passwords']) || ! empty($policy['password_policy']['check_pwned_passwords']);
        $throttleEnabled = ($policy['max_attempts'] ?? $policy['max_login_attempts'] ?? 5) <= 5;
        $minLength = (int) ($policy['min_length'] ?? $policy['password_policy']['min_length'] ?? 8);
        $strongLength = $minLength >= 8;
        $requireSpecial = ! empty($policy['require_symbols']) || ! empty($policy['require_special_char']) || ! empty($policy['password_policy']['require_special_char']) || ! empty($policy['require_numeric']) || ! empty($policy['password_policy']['require_numeric']);

        $totalUsers = User::count();
        $admins = User::role('SuperAdmin')->get();
        $adminCount = $admins->count();
        $adminsWith2fa = $admins->filter(fn($u) => $u->hasTwoFactorEnabled())->count();
        $admin2faPercent = $adminCount > 0 ? round(($adminsWith2fa / $adminCount) * 100) : 100;

        $verifiedUsers = User::whereNotNull('email_verified_at')->count();
        $verifiedPercent = $totalUsers > 0 ? round(($verifiedUsers / $totalUsers) * 100) : 100;

        $score = 0;
        $items = [];

        // 1. HaveIBeenPwned Breach Guard (25 poin)
        if ($checkPwned) {
            $score += 25;
            $items[] = ['name' => 'Deteksi Sandi Bocor (HIBP)', 'passed' => true, 'detail' => 'Pemeriksaan k-Anonymity aktif'];
        } else {
            $items[] = ['name' => 'Deteksi Sandi Bocor (HIBP)', 'passed' => false, 'detail' => 'Belum diaktifkan di Pengaturan'];
        }

        // 2. 2FA Adopsi SuperAdmin (25 poin)
        if ($admin2faPercent >= 100) {
            $score += 25;
            $items[] = ['name' => 'Adopsi 2FA SuperAdmin', 'passed' => true, 'detail' => 'Seluruh SuperAdmin telah mengaktifkan 2FA'];
        } elseif ($admin2faPercent >= 50) {
            $score += 15;
            $items[] = ['name' => 'Adopsi 2FA SuperAdmin', 'passed' => false, 'detail' => "{$admin2faPercent}% SuperAdmin mengaktifkan 2FA"];
        } else {
            $score += 5;
            $items[] = ['name' => 'Adopsi 2FA SuperAdmin', 'passed' => false, 'detail' => 'Mayoritas SuperAdmin belum mengaktifkan 2FA'];
        }

        // 3. Kebijakan Throttle Brute Force (20 poin)
        if ($throttleEnabled) {
            $score += 20;
            $items[] = ['name' => 'Proteksi Brute Force', 'passed' => true, 'detail' => 'Batas percobaan login aktif'];
        } else {
            $items[] = ['name' => 'Proteksi Brute Force', 'passed' => false, 'detail' => 'Ambang batas login terlalu longgar'];
        }

        // 4. Standar Panjang & Karakter Sandi (15 poin)
        if ($strongLength && $requireSpecial) {
            $score += 15;
            $items[] = ['name' => 'Kerumitan Sandi Minimum', 'passed' => true, 'detail' => "Min {$minLength} karakter + angka/simbol"];
        } elseif ($strongLength) {
            $score += 10;
            $items[] = ['name' => 'Kerumitan Sandi Minimum', 'passed' => true, 'detail' => "Min {$minLength} karakter"];
        } else {
            $items[] = ['name' => 'Kerumitan Sandi Minimum', 'passed' => false, 'detail' => 'Panjang sandi kurang dari 8 karakter'];
        }

        // 5. Rasio Email Terverifikasi (15 poin)
        if ($verifiedPercent >= 80) {
            $score += 15;
            $items[] = ['name' => 'Verifikasi Email Pengguna', 'passed' => true, 'detail' => "{$verifiedPercent}% akun memiliki email valid"];
        } else {
            $score += 5;
            $items[] = ['name' => 'Verifikasi Email Pengguna', 'passed' => false, 'detail' => "Baru {$verifiedPercent}% akun terverifikasi"];
        }

        $grade = $score >= 90 ? 'A' : ($score >= 75 ? 'B' : ($score >= 60 ? 'C' : 'D'));
        $status = $score >= 90 ? 'Sangat Kuat' : ($score >= 75 ? 'Kuat' : ($score >= 60 ? 'Cukup' : 'Perlu Ditingkatkan'));

        return [
            'score' => $score,
            'grade' => $grade,
            'status' => $status,
            'items' => $items,
        ];
    }
}
