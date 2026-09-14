<?php

namespace App\Http\Middleware;

use App\Models\Setting;
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
                'user' => fn() => $request->user()
                    ? $request->user()->only(['id', 'name', 'email', 'bio', 'avatar_url'])
                    : null,
                'roles' => fn() => $request->user()
                    ? $request->user()->getRoleNames()
                    : [],
                'permissions' => fn() => $request->user()
                    ? $request->user()->getAllPermissions()->pluck('name')->all()
                    : [],
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
                'info'    => fn() => $request->session()->get('info'),
                'status'  => fn() => $request->session()->get('status'),
            ],
            'banner' => fn() => Setting::get('banner.text', ''),
            'errors' => function () use ($request) {
                if (! $request->hasSession() || ! $request->session()->has('errors')) {
                    return (object) [];
                }

                return (object) collect($request->session()->get('errors')->getBag('default')->messages())
                    ->map(fn($messages) => $messages[0])
                    ->toArray();
            },
        ]);

        return $next($request);
    }
}
