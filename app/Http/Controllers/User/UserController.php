<?php

namespace App\Http\Controllers\User;

use App\Actions\User\CreateUserAction;
use App\Actions\User\UpdateUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\CreateUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Tampilkan direktori pengguna dengan filter dan statistik.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $query = User::with('roles')->latest();

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('bio', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->role($request->role);
        }

        if ($request->filled('status')) {
            if ($request->status === 'verified') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->status === 'unverified') {
                $query->whereNull('email_verified_at');
            }
        }

        $users = $query->paginate(10)
            ->withQueryString()
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

        $availableRoles = Role::orderBy('name')->pluck('name')->all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search ?? '',
                'role' => $request->role ?? '',
                'status' => $request->status ?? '',
            ],
            'availableRoles' => $availableRoles,
        ]);
    }

    /**
     * Simpan pengguna baru dari form admin.
     */
    public function store(CreateUserRequest $request, CreateUserAction $action)
    {
        Gate::authorize('create', User::class);

        $user = $action->execute($request->validated());

        AuditLog::record('users:create', "Menambahkan pengguna baru: {$user->name}", [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return back()->with('success', "Pengguna {$user->name} berhasil ditambahkan.");
    }

    /**
     * Perbarui data pengguna dan role dari form admin.
     */
    public function update(UpdateUserRequest $request, User $user, UpdateUserAction $action)
    {
        Gate::authorize('update', $user);

        $action->execute($user, $request->validated());

        AuditLog::record('users:update', "Memperbarui data pengguna: {$user->name}", [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return back()->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    /**
     * Hapus akun pengguna.
     */
    public function destroy(Request $request, User $user)
    {
        Gate::authorize('delete', $user);

        abort_if($user->is($request->user()), 403, 'Tidak bisa menghapus akun sendiri.');

        $name = $user->name;
        $userId = $user->id;
        $user->delete();

        AuditLog::record('users:delete', "Menghapus pengguna: {$name}", [
            'user_id' => $userId,
        ]);

        return back()->with('success', "Pengguna {$name} berhasil dihapus.");
    }
}

