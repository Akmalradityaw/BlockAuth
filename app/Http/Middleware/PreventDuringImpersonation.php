<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventDuringImpersonation
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->has('impersonator_id')) {
            return redirect()->back()->with('warning', 'Aksi ini dinonaktifkan selama mode impersonasi untuk melindungi keamanan akun target.');
        }

        return $next($request);
    }
}

