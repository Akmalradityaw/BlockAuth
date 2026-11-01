<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFeatureEnabled
{
    /**
     * Pastikan modul/halaman fitur yang diminta aktif sebelum mengizinkan akses.
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $enabled = (bool) Setting::get("features.{$feature}", true);

        if (! $enabled) {
            $labels = [
                'users' => 'Manajemen Pengguna',
                'roles' => 'Matriks Akses & Peran',
                'audit_logs' => 'Log Audit Sistem',
                'registration' => 'Pendaftaran Publik',
            ];

            $name = $labels[$feature] ?? ucfirst($feature);
            $message = "Modul {$name} sedang dinonaktifkan oleh Administrator.";

            if ($feature === 'registration') {
                return to_route('login')->with('warning', $message);
            }

            return to_route('dashboard')->with('warning', $message);
        }

        return $next($request);
    }
}

