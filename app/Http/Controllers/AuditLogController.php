<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Support\AgentParser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('audit_logs:read');

        $query = AuditLog::with('user:id,name,email,avatar_path')
            ->latest('id');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $sort = in_array($request->sort, ['id', 'action', 'created_at']) ? $request->sort : 'id';
        $direction = strtolower($request->direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $perPage = in_array((int) $request->per_page, [10, 15, 25, 50, 100]) ? (int) $request->per_page : 15;

        $logs = $query->paginate($perPage)->withQueryString()->through(function ($log) {
            $agent = AgentParser::parse($log->user_agent);

            return [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'ip_address' => $log->ip_address ?? '127.0.0.1',
                'browser' => $agent['browser'],
                'platform' => $agent['platform'],
                'device_type' => $agent['device_type'],
                'properties' => $log->properties,
                'created_at' => $log->created_at ? $log->created_at->format('d M Y H:i:s') : '-',
                'created_at_human' => $log->created_at ? $log->created_at->diffForHumans() : '-',
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'email' => $log->user->email,
                    'avatar_url' => $log->user->avatar_url,
                ] : null,
            ];
        });

        $stats = [
            'total' => AuditLog::count(),
            'logins_today' => AuditLog::where('action', 'auth:login')->whereDate('created_at', today())->count(),
            'failed_today' => AuditLog::where('action', 'auth:failed')->whereDate('created_at', today())->count(),
            'system_changes' => AuditLog::whereIn('action', [
                'settings:toggle',
                'settings:banner',
                'roles:permissions_update',
            ])->count(),
        ];

        $actions = AuditLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->values()
            ->all();

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'filters' => [
                'search' => $request->search ?? '',
                'action' => $request->action ?? '',
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
            'stats' => $stats,
            'actionOptions' => $actions,
        ]);
    }
}
