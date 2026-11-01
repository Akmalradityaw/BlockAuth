<?php

namespace App\Http\Controllers\Audit;

use App\Actions\Audit\ExportAuditLogsAction;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Support\AgentParser;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends Controller
{
    /**
     * Tampilkan halaman daftar riwayat audit log.
     */
    public function index(Request $request): Response
    {
        if (! auth()->user()->hasRole('SuperAdmin') && ! auth()->user()->can('audit_logs:read')) {
            abort(403, 'Akses terbatas untuk Administrator.');
        }

        $query = AuditLog::with('user:id,name,email,avatar_path');

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
                'settings:update',
                'settings:maintenance',
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

    /**
     * Tampilkan halaman dedikasi ekspor log audit (Inertia View)
     * atau unduh langsung jika diminta melalui non-Inertia request dengan format.
     */
    public function export(Request $request, ExportAuditLogsAction $action)
    {
        if (! auth()->user()->hasRole('SuperAdmin') && ! auth()->user()->can('audit_logs:read')) {
            abort(403, 'Akses terbatas untuk Administrator.');
        }

        if ($request->filled('format') && ! $request->header('X-Inertia')) {
            return $this->download($request, $action);
        }

        // Alihkan tampilan UI ke Pusat Ekspor & Impor Terpadu
        return redirect()->route('data-port.index', array_filter([
            'entity' => 'audit',
            'mode' => 'export',
            'action' => $request->query('action'),
            'search' => $request->query('search'),
        ]));
    }

    /**
     * Unduh berkas ekspor log audit.
     */
    public function download(Request $request, ExportAuditLogsAction $action): StreamedResponse
    {
        if (! auth()->user()->hasRole('SuperAdmin') && ! auth()->user()->can('audit_logs:read')) {
            abort(403, 'Akses terbatas untuk Administrator.');
        }

        $format = $request->query('format', 'csv');
        $filters = [
            'search' => $request->query('search'),
            'action' => $request->query('action'),
        ];

        $columns = [];
        if ($request->filled('columns')) {
            $colsParam = $request->query('columns');
            $columns = is_array($colsParam) ? $colsParam : explode(',', (string) $colsParam);
        }

        return $action->execute($format, $filters, $columns);
    }
}

