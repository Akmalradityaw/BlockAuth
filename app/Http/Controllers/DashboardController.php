<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $recent = User::with('roles')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'roles' => $user->roles->pluck('name'),
                'joined' => $user->created_at->format('d M Y'),
            ]);

        return Inertia::render('Dashboard', [
            'user' => auth()->user()->only([
                'id', 'name', 'email', 'bio', 'avatar_url',
            ]),
            'stats' => [
                'total' => User::count(),
                'verified' => User::whereNotNull('email_verified_at')->count(),
                'admins' => User::role('SuperAdmin')->count(),
            ],
            'recentUsers' => $recent,
            'isSuperAdmin' => auth()->user()->isSuperAdmin(),
        ]);
    }
}
