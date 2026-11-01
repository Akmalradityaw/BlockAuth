<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenance
{
    /**
     * Rute yang selalu diizinkan agar SuperAdmin atau pengguna tidak terkunci.
     */
    protected array $exceptRoutes = [
        'maintenance.*',
        'login',
        'logout',
        'two-factor.*',
        'settings.*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (Setting::get('maintenance.enabled', false)) {
            // SuperAdmin selalu diizinkan mengakses seluruh rute
            if ($request->user()?->isSuperAdmin()) {
                return $next($request);
            }

            // Izinkan rute esensial untuk proses autentikasi dan penonaktifan
            foreach ($this->exceptRoutes as $except) {
                if ($request->routeIs($except)) {
                    return $next($request);
                }
            }

            abort(503, 'Sistem dalam pemeliharaan.');
        }

        return $next($request);
    }
}
