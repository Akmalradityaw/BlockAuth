<?php

namespace App\Http\Controllers\DataPort;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DataPortController extends Controller
{
    /**
     * Tampilkan Pusat Ekspor & Impor Terpadu BlockAuth.
     */
    public function index(Request $request): Response
    {
        $selectedIds = [];
        if ($request->filled('ids')) {
            $idsParam = $request->query('ids');
            $selectedIds = is_array($idsParam) ? $idsParam : explode(',', (string) $idsParam);
            $selectedIds = array_filter(array_map('intval', $selectedIds));
        }

        $availableRoles = Role::orderBy('name')->pluck('name')->all();
        $actionOptions = AuditLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->values()
            ->all();

        return Inertia::render('DataPort/Index', [
            'availableRoles' => $availableRoles,
            'actionOptions' => $actionOptions,
            'stats' => [
                'users_total' => User::count(),
                'users_verified' => User::whereNotNull('email_verified_at')->count(),
                'audit_total' => AuditLog::count(),
                'settings_total' => count(Setting::all()),
            ],
            'initialMode' => $request->query('mode', 'export'), // 'export' | 'import'
            'initialEntity' => $request->query('entity', 'users'), // 'users' | 'audit' | 'settings'
            'selectedIds' => array_values($selectedIds),
        ]);
    }
}

