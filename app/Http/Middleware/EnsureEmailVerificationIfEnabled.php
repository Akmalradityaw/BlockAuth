<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailVerificationIfEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        $mustVerify = Setting::get('auth.must_verify_email', false);

        if ($mustVerify && $request->user()) {
            if (! $request->user()->hasVerifiedEmail() && ! $request->is('verify-email*', 'email/*', 'logout')) {
                return redirect()->route('verification.notice');
            }
        }

        return $next($request);
    }
}
