<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        // ponytail: flag sendiri agar SuperAdmin tidak terkunci seperti artisan down; jebol di multi-server, pakai down di sana.
        // Rute maintenance.* selalu lolos agar admin bisa masuk saat mode aktif.
        if (Setting::get('maintenance.enabled', false)
            && ! $request->user()?->isSuperAdmin()
            && ! $request->routeIs('maintenance.*')) {
            abort(503, 'Sistem dalam pemeliharaan.');
        }

        return $next($request);
    }
}
