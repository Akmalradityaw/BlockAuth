<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\IpRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

use Inertia\Inertia;

class IpRuleController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('settings:read');

        $query = IpRule::with('creator');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');
        $allowedSorts = ['id', 'ip_address', 'type', 'is_active', 'created_at'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        }

        $rules = $query->paginate($request->input('per_page', 10))->withQueryString();

        $stats = [
            'total' => IpRule::count(),
            'blacklist' => IpRule::where('type', 'blacklist')->where('is_active', true)->count(),
            'whitelist' => IpRule::where('type', 'whitelist')->where('is_active', true)->count(),
            'my_ip' => $request->ip(),
        ];

        return Inertia::render('Security/IpRules', [
            'rules' => $rules,
            'filters' => $request->only(['search', 'type', 'is_active', 'sort', 'direction']),
            'stats' => $stats,
        ]);
    }
    public function store(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'ip_address' => ['required', 'ip'],
            'type' => ['required', 'string', Rule::in(['blacklist', 'whitelist'])],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $rule = IpRule::create([
            'ip_address' => $data['ip_address'],
            'type' => $data['type'],
            'reason' => $data['reason'] ?? null,
            'created_by' => $request->user()->id,
            'is_active' => true,
        ]);

        AuditLog::record(
            'ip_rule:created',
            "Menambahkan aturan IP: {$rule->ip_address} ({$rule->type})",
            ['ip' => $rule->ip_address, 'type' => $rule->type, 'reason' => $rule->reason]
        );

        return back()->with('success', "Aturan {$rule->type} untuk IP {$rule->ip_address} berhasil ditambahkan.");
    }

    public function destroy(IpRule $ipRule)
    {
        Gate::authorize('settings:manage');

        $ip = $ipRule->ip_address;
        $type = $ipRule->type;
        $ipRule->delete();

        AuditLog::record(
            'ip_rule:deleted',
            "Menghapus aturan IP: {$ip} ({$type})",
            ['ip' => $ip, 'type' => $type]
        );

        return back()->with('success', "Aturan IP {$ip} berhasil dihapus.");
    }

    public function toggle(IpRule $ipRule)
    {
        Gate::authorize('settings:manage');

        $ipRule->update([
            'is_active' => ! $ipRule->is_active,
        ]);

        $status = $ipRule->is_active ? 'diaktifkan' : 'dinonaktifkan';

        AuditLog::record(
            'ip_rule:toggled',
            "Status aturan IP {$ipRule->ip_address} {$status}",
            ['ip' => $ipRule->ip_address, 'is_active' => $ipRule->is_active]
        );

        return back()->with('success', "Aturan IP {$ipRule->ip_address} berhasil {$status}.");
    }
}
