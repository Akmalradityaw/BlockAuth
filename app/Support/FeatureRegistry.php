<?php

namespace App\Support;

use App\Models\Setting;

class FeatureRegistry
{
    /**
     * Cek apakah suatu modul fitur diaktifkan.
     */
    public static function isEnabled(string $feature): bool
    {
        return (bool) Setting::get("features.{$feature}", true);
    }

    /**
     * Dapatkan semua status modul fitur.
     */
    public static function all(): array
    {
        return [
            'users' => static::isEnabled('users'),
            'roles' => static::isEnabled('roles'),
            'audit_logs' => static::isEnabled('audit_logs'),
            'registration' => static::isEnabled('registration'),
            'magic_link' => static::isEnabled('magic_link'),
        ];
    }

    /**
     * Definisi metadata modul halaman.
     */
    public static function definitions(): array
    {
        return [
            'users' => [
                'title' => 'Manajemen Pengguna (/users)',
                'desc' => 'Akses daftar pengguna, penambahan akun, pengubahan role, serta fitur ekspor CSV.',
                'badge' => 'Data Akun',
            ],
            'roles' => [
                'title' => 'Matriks Akses & Hak Peran (/roles/permissions)',
                'desc' => 'Pengaturan izin granular (permissions) dan pemetaan hak akses berbasis peran Spatie.',
                'badge' => 'RBAC',
            ],
            'audit_logs' => [
                'title' => 'Log Audit Sistem (/audit-logs)',
                'desc' => 'Pelacakan riwayat aktivitas penting (login, perubahan data, pengaturan sistem) untuk kebutuhan keamanan.',
                'badge' => 'Audit Trail',
            ],
            'registration' => [
                'title' => 'Pendaftaran Akun Publik (/register)',
                'desc' => 'Buka atau tutup form registrasi untuk pengguna umum. Jika dimatikan, hanya admin yang dapat membuat akun.',
                'badge' => 'Autentikasi',
            ],
            'magic_link' => [
                'title' => 'Login Magic Link Passwordless (/magic-link)',
                'desc' => 'Autentikasi tanpa kata sandi via tautan sekali pakai yang dikirimkan ke email terdaftar.',
                'badge' => 'Passwordless',
            ],
        ];
    }
}

