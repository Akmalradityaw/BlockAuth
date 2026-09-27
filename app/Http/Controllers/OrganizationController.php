<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('users:read');

        $query = Organization::with(['owner:id,name,email', 'members.user:id,name,email']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        $allowedSorts = ['name', 'slug', 'is_active', 'created_at'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        }

        $organizations = $query->paginate($request->input('per_page', 10))->withQueryString();

        $stats = [
            'total' => Organization::count(),
            'active' => Organization::where('is_active', true)->count(),
            'total_members' => OrganizationMember::count(),
            'my_orgs' => OrganizationMember::where('user_id', $request->user()->id)->count(),
        ];

        $users = User::select(['id', 'name', 'email'])->orderBy('name')->take(50)->get();

        return Inertia::render('Organizations/Index', [
            'organizations' => $organizations,
            'filters' => $request->only(['search', 'is_active', 'sort', 'direction', 'per_page']),
            'stats' => $stats,
            'availableUsers' => $users,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('users:create');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100', 'unique:organizations,slug'],
            'description' => ['nullable', 'string', 'max:500'],
            'max_members' => ['nullable', 'integer', 'min:2', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $slug = !empty($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['name']);
        if (Organization::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::random(5);
        }

        $org = Organization::create([
            'name' => $data['name'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'owner_id' => $request->user()->id,
            'max_members' => $data['max_members'] ?? 50,
            'is_active' => $data['is_active'] ?? true,
        ]);

        OrganizationMember::create([
            'organization_id' => $org->id,
            'user_id' => $request->user()->id,
            'role' => 'owner',
        ]);

        AuditLog::record('organization:created', "Membuat organisasi baru: {$org->name}", [
            'org_id' => $org->id,
            'slug' => $org->slug,
        ], $request->user());

        return back()->with('success', "Organisasi '{$org->name}' berhasil dibuat.");
    }

    public function update(Request $request, Organization $organization)
    {
        Gate::authorize('users:update');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', Rule::unique('organizations', 'slug')->ignore($organization->id)],
            'description' => ['nullable', 'string', 'max:500'],
            'max_members' => ['required', 'integer', 'min:2', 'max:1000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $organization->update([
            'name' => $data['name'],
            'slug' => Str::slug($data['slug']),
            'description' => $data['description'],
            'max_members' => $data['max_members'],
            'is_active' => $data['is_active'],
        ]);

        AuditLog::record('organization:updated', "Memperbarui informasi organisasi: {$organization->name}", [
            'org_id' => $organization->id,
        ], $request->user());

        return back()->with('success', 'Informasi organisasi berhasil diperbarui.');
    }

    public function destroy(Request $request, Organization $organization)
    {
        Gate::authorize('users:delete');

        $name = $organization->name;
        $organization->delete();

        AuditLog::record('organization:deleted', "Menghapus organisasi: {$name}", [
            'org_id' => $organization->id,
        ], $request->user());

        return back()->with('success', "Organisasi '{$name}' telah dihapus.");
    }

    public function addMember(Request $request, Organization $organization)
    {
        Gate::authorize('users:update');

        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', 'string', Rule::in(['admin', 'member', 'guest'])],
        ]);

        if ($organization->members()->where('user_id', $data['user_id'])->exists()) {
            return back()->with('error', 'Pengguna ini sudah terdaftar sebagai anggota organisasi.');
        }

        if ($organization->members()->count() >= $organization->max_members) {
            return back()->with('error', 'Kapasitas maksimal anggota organisasi telah tercapai.');
        }

        OrganizationMember::create([
            'organization_id' => $organization->id,
            'user_id' => $data['user_id'],
            'role' => $data['role'],
        ]);

        return back()->with('success', 'Anggota berhasil ditambahkan ke organisasi.');
    }

    public function removeMember(Request $request, Organization $organization, User $user)
    {
        Gate::authorize('users:update');

        if ($organization->owner_id === $user->id) {
            return back()->with('error', 'Pemilik organisasi tidak dapat dihapus.');
        }

        OrganizationMember::where('organization_id', $organization->id)
            ->where('user_id', $user->id)
            ->delete();

        return back()->with('success', 'Anggota berhasil dikeluarkan dari organisasi.');
    }
}
