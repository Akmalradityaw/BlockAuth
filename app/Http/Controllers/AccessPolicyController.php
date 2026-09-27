<?php

namespace App\Http\Controllers;

use App\Models\AccessPolicy;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AccessPolicyController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('settings:read');

        $query = AccessPolicy::with('creator:id,name,email');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $policies = $query->latest()->paginate($request->input('per_page', 10))->withQueryString();

        $stats = [
            'total' => AccessPolicy::count(),
            'active' => AccessPolicy::where('is_active', true)->count(),
            'geofencing' => AccessPolicy::where('type', 'geofencing')->count(),
            'connection' => AccessPolicy::where('type', 'connection_security')->count(),
        ];

        return Inertia::render('Security/Policies', [
            'policies' => $policies,
            'filters' => $request->only(['search', 'type', 'action', 'is_active', 'per_page']),
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', 'string', Rule::in(['geofencing', 'time_restriction', 'connection_security'])],
            'action' => ['required', 'string', Rule::in(['block', 'allow'])],
            'description' => ['nullable', 'string', 'max:500'],
            'rules' => ['required', 'array'],
        ]);

        $policy = AccessPolicy::create([
            'name' => $data['name'],
            'type' => $data['type'],
            'action' => $data['action'],
            'rules' => $data['rules'],
            'description' => $data['description'] ?? null,
            'is_active' => true,
            'created_by' => $request->user()->id,
        ]);

        AuditLog::record('access_policy:created', "Membuat kebijakan akses baru: {$policy->name}", [
            'policy_id' => $policy->id,
            'type' => $policy->type,
        ], $request->user());

        return back()->with('success', "Kebijakan akses '{$policy->name}' berhasil disimpan.");
    }

    public function update(Request $request, AccessPolicy $accessPolicy)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', 'string', Rule::in(['geofencing', 'time_restriction', 'connection_security'])],
            'action' => ['required', 'string', Rule::in(['block', 'allow'])],
            'description' => ['nullable', 'string', 'max:500'],
            'rules' => ['required', 'array'],
        ]);

        $accessPolicy->update($data);

        return back()->with('success', 'Kebijakan akses berhasil diperbarui.');
    }

    public function toggle(Request $request, AccessPolicy $accessPolicy)
    {
        Gate::authorize('settings:manage');

        $accessPolicy->update(['is_active' => ! $accessPolicy->is_active]);

        return back()->with('success', 'Status kebijakan akses berhasil diperbarui.');
    }

    public function destroy(Request $request, AccessPolicy $accessPolicy)
    {
        Gate::authorize('settings:manage');

        $name = $accessPolicy->name;
        $accessPolicy->delete();

        AuditLog::record('access_policy:deleted', "Menghapus kebijakan akses: {$name}", [], $request->user());

        return back()->with('success', "Kebijakan '{$name}' telah dihapus.");
    }
}
