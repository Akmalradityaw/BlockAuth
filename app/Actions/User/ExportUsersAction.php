<?php

namespace App\Actions\User;

use App\Models\AuditLog;
use App\Models\User;
use App\Support\DataPort\DataExporterManager;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportUsersAction
{
    public function execute(string $format, array $filters = [], array $selectedIds = [], array $columns = []): StreamedResponse
    {
        $query = User::with('roles')->latest();

        if (! empty($selectedIds)) {
            $query->whereIn('id', $selectedIds);
        } else {
            if (! empty($filters['search'])) {
                $search = trim($filters['search']);
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('bio', 'like', "%{$search}%");
                });
            }

            if (! empty($filters['role'])) {
                $query->role($filters['role']);
            }

            if (! empty($filters['status'])) {
                if ($filters['status'] === 'verified') {
                    $query->whereNotNull('email_verified_at');
                } elseif ($filters['status'] === 'unverified') {
                    $query->whereNull('email_verified_at');
                }
            }
        }

        $availableMap = [
            'id' => ['label' => 'ID', 'getter' => fn ($u) => $u->id],
            'name' => ['label' => 'Nama', 'getter' => fn ($u) => $u->name],
            'email' => ['label' => 'Email', 'getter' => fn ($u) => $u->email],
            'role' => ['label' => 'Role', 'getter' => fn ($u) => $u->roles->pluck('name')->join(', ')],
            'status' => ['label' => 'Status Verifikasi', 'getter' => fn ($u) => $u->email_verified_at ? 'Verified' : 'Unverified'],
            'bio' => ['label' => 'Bio', 'getter' => fn ($u) => $u->bio ?? ''],
            'created_at' => ['label' => 'Tanggal Bergabung', 'getter' => fn ($u) => $u->created_at ? $u->created_at->format('Y-m-d H:i:s') : '-'],
        ];

        $activeCols = empty($columns) ? array_keys($availableMap) : array_values(array_intersect($columns, array_keys($availableMap)));
        if (empty($activeCols)) {
            $activeCols = array_keys($availableMap);
        }

        $headers = array_map(fn ($k) => $availableMap[$k]['label'], $activeCols);
        $filename = 'users-' . now()->format('Y-m-d-His');

        $rowsGenerator = function () use ($query, $activeCols, $availableMap) {
            foreach ($query->lazyById(250) as $user) {
                $row = [];
                foreach ($activeCols as $colKey) {
                    $row[] = $availableMap[$colKey]['getter']($user);
                }
                yield $row;
            }
        };

        AuditLog::record('users:export', "Mengekspor data pengguna (format: {$format})", [
            'format' => $format,
            'filters' => $filters,
            'selected_ids_count' => count($selectedIds),
            'columns' => $activeCols,
        ]);

        return DataExporterManager::stream($format, $filename, $headers, $rowsGenerator());
    }
}
