<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', User::class);

        $users = User::with('roles')
            ->latest()
            ->paginate(10)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'avatar_url' => $user->avatar_url,
                'roles' => $user->roles->pluck('name'),
                'verified' => ! is_null($user->email_verified_at),
                'joined' => $user->created_at->format('d M Y'),
            ]);

        $stats = [
            'total' => User::count(),
            'verified' => User::whereNotNull('email_verified_at')->count(),
            'admins' => User::role('SuperAdmin')->count(),
        ];

        return Inertia::render('Users/Index', [
            'users' => $users,
            'stats' => $stats,
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        Gate::authorize('users:delete');

        abort_if($user->is($request->user()), 403, 'Tidak bisa menghapus akun sendiri.');

        $name = $user->name;
        $user->delete();

        return back()->with('success', "Pengguna {$name} berhasil dihapus.");
    }
}