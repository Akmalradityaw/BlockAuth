<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('roles:manage');

        return Inertia::render('RolePermissions/Index', [
            'roles' => Role::with('permissions:id,name')
                ->get(['id', 'name', 'label', 'description', 'is_system'])
                ->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'description' => $role->description,
                    'is_system' => (bool) $role->is_system,
                    'permissions' => $role->permissions->pluck('name')->all(),
                ]),
            'allPermissions' => Permission::orderBy('name')->pluck('name')->all(),
        ]);
    }

    public function update(Request $request)
    {
        Gate::authorize('roles:manage');

        $known = Permission::pluck('name')->all();

        $data = $request->validate([
            'matrix' => ['required', 'array'],
            'matrix.*' => ['array'],
            'matrix.*.*' => ['string', Rule::in($known)],
        ]);

        foreach ($data['matrix'] as $roleId => $perms) {
            // ponytail: no self-lockout guard; rerun RbacSeeder to recover roles:manage.
            Role::findOrFail($roleId)->syncPermissions($perms);
        }

        return back()->with('success', 'Matriks permission berhasil disimpan.');
    }
}