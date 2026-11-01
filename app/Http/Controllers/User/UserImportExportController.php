<?php

namespace App\Http\Controllers\User;

use App\Actions\User\ExportUsersAction;
use App\Actions\User\ImportUsersAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\ImportUsersRequest;
use App\Models\Role;
use App\Models\User;
use App\Support\DataPort\DataExporterManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserImportExportController extends Controller
{
    /**
     * Tampilkan halaman dedikasi ekspor pengguna (Inertia View)
     * atau langsung unduh berkas jika diminta melalui parameter non-Inertia.
     */
    public function export(Request $request, ExportUsersAction $action)
    {
        Gate::authorize('viewAny', User::class);

        // Kompatibilitas download langsung (non-Inertia request dengan parameter format)
        if ($request->filled('format') && ! $request->header('X-Inertia')) {
            return $this->download($request, $action);
        }

        // Alihkan tampilan UI ke Pusat Ekspor & Impor Terpadu
        return redirect()->route('data-port.index', array_filter([
            'entity' => 'users',
            'mode' => 'export',
            'ids' => $request->query('ids'),
            'role' => $request->query('role'),
            'status' => $request->query('status'),
            'search' => $request->query('search'),
        ]));
    }

    /**
     * Unduh berkas data pengguna yang telah dikonfigurasi.
     */
    public function download(Request $request, ExportUsersAction $action): StreamedResponse
    {
        Gate::authorize('viewAny', User::class);

        $format = $request->query('format', 'csv');
        $selectedIds = [];
        if ($request->filled('ids')) {
            $idsParam = $request->query('ids');
            $selectedIds = is_array($idsParam) ? $idsParam : explode(',', (string) $idsParam);
            $selectedIds = array_filter(array_map('intval', $selectedIds));
        }

        $filters = [
            'search' => $request->query('search'),
            'role' => $request->query('role'),
            'status' => $request->query('status'),
        ];

        $columns = [];
        if ($request->filled('columns')) {
            $colsParam = $request->query('columns');
            $columns = is_array($colsParam) ? $colsParam : explode(',', (string) $colsParam);
        }

        return $action->execute($format, $filters, $selectedIds, $columns);
    }

    /**
     * Impor data pengguna dari berkas terunggah (7 format).
     */
    public function import(ImportUsersRequest $request, ImportUsersAction $action)
    {
        Gate::authorize('create', User::class);

        $report = $action->execute($request->file('file'), $request->user());

        $msg = "Berhasil mengimpor {$report['imported']} pengguna.";
        if ($report['skipped'] > 0) {
            $msg .= " ({$report['skipped']} baris dilewati).";
        }

        return back()->with([
            'success' => $msg,
            'import_report' => $report,
        ]);
    }

    /**
     * Unduh berkas template impor pengguna siap pakai.
     */
    public function template(Request $request): StreamedResponse
    {
        Gate::authorize('create', User::class);

        $format = $request->query('format', 'csv');
        $headers = ['name', 'email', 'role', 'password'];
        $sampleRows = [
            ['Budi Santoso', 'budi.santoso@example.com', 'Staff', 'Secret123!'],
            ['Siti Rahma', 'siti.rahma@example.com', 'Editor', ''],
            ['Ahmad Fauzi', 'ahmad.fauzi@example.com', 'Viewer', ''],
        ];

        return DataExporterManager::stream($format, 'template_pengguna', $headers, $sampleRows);
    }
}
