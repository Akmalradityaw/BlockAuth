<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        Inertia::share([
            'auth' => [
                'user' => fn () => $request->user()
                    ? $request->user()->only(['id', 'name', 'email', 'bio', 'avatar_url'])
                    : null,
                'roles' => fn () => $request->user()
                    ? $request->user()->getRoleNames()
                    : [],
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
        ]);

        return $next($request);
    }
}
