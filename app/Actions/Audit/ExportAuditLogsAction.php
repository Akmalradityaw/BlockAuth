<?php

namespace App\Actions\Audit;

use App\Models\AuditLog;
use App\Support\DataPort\DataExporterManager;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportAuditLogsAction
{
    public function execute(string $format, array $filters = [], array $columns = []): StreamedResponse
    {
        $query = AuditLog::with('user:id,name,email')->latest('id');

        if (! empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (! empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $availableMap = [
            'id' => ['label' => 'ID', 'getter' => fn ($l) => $l->id],
            'action' => ['label' => 'Aksi', 'getter' => fn ($l) => $l->action],
            'description' => ['label' => 'Deskripsi', 'getter' => fn ($l) => $l->description],
            'actor_name' => ['label' => 'Nama Aktor', 'getter' => fn ($l) => $l->user->name ?? 'Sistem / Tamu'],
            'actor_email' => ['label' => 'Email Aktor', 'getter' => fn ($l) => $l->user->email ?? '-'],
            'ip_address' => ['label' => 'IP Address', 'getter' => fn ($l) => $l->ip_address ?? '127.0.0.1'],
            'user_agent' => ['label' => 'User Agent', 'getter' => fn ($l) => $l->user_agent ?? '-'],
            'created_at' => ['label' => 'Waktu', 'getter' => fn ($l) => $l->created_at ? $l->created_at->format('Y-m-d H:i:s') : '-'],
        ];

        $activeCols = empty($columns) ? array_keys($availableMap) : array_values(array_intersect($columns, array_keys($availableMap)));
        if (empty($activeCols)) {
            $activeCols = array_keys($availableMap);
        }

        $headers = array_map(fn ($k) => $availableMap[$k]['label'], $activeCols);
        $filename = 'audit-logs-' . now()->format('Y-m-d-His');

        $rowsGenerator = function () use ($query, $activeCols, $availableMap) {
            foreach ($query->lazyById(250) as $log) {
                $row = [];
                foreach ($activeCols as $colKey) {
                    $row[] = $availableMap[$colKey]['getter']($log);
                }
                yield $row;
            }
        };

        AuditLog::record('audit_logs:export', "Mengekspor catatan log audit (format: {$format})", [
            'format' => $format,
            'filters' => $filters,
            'columns' => $activeCols,
        ]);

        return DataExporterManager::stream($format, $filename, $headers, $rowsGenerator());
    }
}
