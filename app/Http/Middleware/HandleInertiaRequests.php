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
                    ? array_merge($request->user()->only(['id', 'name', 'email', 'bio', 'avatar_url']), [
                        'two_factor_enabled' => $request->user()->hasTwoFactorEnabled(),
                    ])
                    : null,
                'roles' => fn() => $request->user()
                    ? $request->user()->getRoleNames()
                    : [],
                'permissions' => fn() => $request->user()
                    ? $request->user()->getAllPermissions()->pluck('name')->all()
                    : [],
            ],
            'is_impersonating' => fn() => $request->session()->has('impersonator_id'),
            'impersonator' => fn() => $request->session()->has('impersonator_id')
                ? \App\Models\User::find($request->session()->get('impersonator_id'))?->only(['id', 'name', 'email'])
                : null,
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
                'info'    => fn() => $request->session()->get('info'),
                'status'  => fn() => $request->session()->get('status'),
            ],
            'banner' => fn() => Setting::get('banner.enabled', false) ? Setting::get('banner.text', '') : '',
            'banner_style' => fn() => Setting::get('banner.enabled', false) ? Setting::get('banner.style', 'warning') : 'warning',
            'announcements' => function () use ($request) {
                if (! $request->user()) {
                    return [];
                }

                $announcements = \App\Models\Announcement::active()
                    ->orderBy('pinned', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get();

                if ($announcements->isEmpty()) {
                    return [];
                }

                $readAnnouncementIds = \App\Models\AnnouncementRead::where('user_id', $request->user()->id)
                    ->whereIn('announcement_id', $announcements->pluck('id'))
                    ->pluck('announcement_id')
                    ->flip();

                return $announcements->map(function ($a) use ($readAnnouncementIds) {
                    return [
                        'id' => $a->id,
                        'title' => $a->title,
                        'content' => $a->content,
                        'type' => $a->type,
                        'pinned' => $a->pinned,
                        'is_read' => $readAnnouncementIds->has($a->id),
                        'created_at' => $a->created_at->diffForHumans(),
                    ];
                });
            },
            'unread_announcements_count' => fn() => $request->user()
                ? \App\Models\Announcement::active()
                    ->whereDoesntHave('reads', fn($q) => $q->where('user_id', $request->user()->id))
                    ->count()
                : 0,
            'password_policy' => fn() => \App\Support\PasswordPolicy::get(),
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
