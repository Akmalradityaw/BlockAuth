<?php

namespace App\Http\Middleware;

use App\Models\IpRule;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class CheckIpRules
{
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();

        $isBlocked = false;
        try {
            if ($ip && Schema::hasTable('ip_rules') && IpRule::isBlacklisted($ip)) {
                $isBlocked = true;
            }
        } catch (\Throwable $e) {
            // Defensive bypass if database/table is not initialized or migrated yet
        }

        if ($isBlocked) {
            abort(403, "Akses dari alamat IP Anda ({$ip}) telah diblokir demi alasan keamanan sistem.");
        }

        return $next($request);
    }
}
