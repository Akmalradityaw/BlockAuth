<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $query = User::with('roles');

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('bio', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->role($request->role);
        }

        $sort = in_array($request->sort, ['name', 'email', 'created_at', 'id']) ? $request->sort : 'id';
        $direction = strtolower($request->direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $perPage = in_array((int) $request->per_page, [10, 25, 50, 100]) ? (int) $request->per_page : 10;

        $users = $query->paginate($perPage)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
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

        $availableRoles = \App\Models\Role::orderBy('name')->pluck('name')->all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search ?? '',
                'role' => $request->role ?? '',
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
            'availableRoles' => $availableRoles,
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        Gate::authorize('users:delete');

        abort_if($user->is($request->user()), 403, 'Tidak bisa menghapus akun sendiri.');

        $name = $user->name;
        $email = $user->email;
        $userId = $user->id;
        $user->delete();

        \App\Models\AuditLog::record(
            'users:delete',
            "Menghapus akun pengguna: {$name} ({$email})",
            ['user_id' => $userId, 'name' => $name, 'email' => $email]
        );

        return back()->with('success', "Pengguna {$name} berhasil dihapus.");
    }

    public function updateRole(Request $request, User $user)
    {
        Gate::authorize('roles:manage');
        
        abort_if($user->is($request->user()), 403, 'Tidak bisa mengubah role akun sendiri.');

        $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user->syncRoles([$request->role]);

        return back()->with('success', "Role {$user->name} berhasil diubah menjadi {$request->role}.");
    }
}