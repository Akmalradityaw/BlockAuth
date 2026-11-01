<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Models\User;
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
                    ? array_merge(
                        $request->user()->only(['id', 'name', 'email', 'bio', 'avatar_url']),
                        ['two_factor_enabled' => $request->user()->hasTwoFactorEnabled()]
                    )
                    : null,
                'roles' => fn() => $request->user()
                    ? $request->user()->getRoleNames()
                    : [],
                'permissions' => fn() => $request->user()
                    ? $request->user()->getAllPermissions()->pluck('name')->all()
                    : [],
                'is_impersonating' => fn() => $request->session()->has('impersonator_id'),
                'impersonator' => fn() => $request->session()->has('impersonator_id')
                    ? User::find($request->session()->get('impersonator_id'))?->only(['id', 'name', 'email'])
                    : null,
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
                'info'    => fn() => $request->session()->get('info'),
                'status'  => fn() => $request->session()->get('status'),
                'recovery_codes' => fn() => $request->session()->get('recovery_codes'),
            ],
            'features' => [
                'users' => (bool) Setting::get('features.users', true),
                'roles' => (bool) Setting::get('features.roles', true),
                'audit_logs' => (bool) Setting::get('features.audit_logs', true),
                'registration' => (bool) Setting::get('features.registration', true),
                'magic_link' => (bool) Setting::get('features.magic_link', true),
            ],
            'app' => [
                'name' => (string) Setting::get('app.name', 'BlockAuth'),
                'tagline' => (string) Setting::get('app.tagline', 'Auth dan Profil'),
                'logo_url' => (string) Setting::get('app.logo_url', ''),
                'footer_text' => (string) Setting::get('app.footer_text', '© ' . date('Y') . ' BlockAuth. All rights reserved.'),
            ],
            'banner' => function () {
                $enabled = (bool) Setting::get('banner.enabled', false);
                $text = (string) Setting::get('banner.text', '');
                if (! $enabled || empty(trim($text))) {
                    return null;
                }
                return [
                    'text' => $text,
                    'style' => (string) Setting::get('banner.style', 'warning'),
                ];
            },
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
