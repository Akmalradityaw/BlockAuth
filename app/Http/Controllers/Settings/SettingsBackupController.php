<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\ExportSettingsAction;
use App\Actions\Settings\RestoreSettingsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\RestoreSettingsRequest;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SettingsBackupController extends Controller
{
    /**
     * Unduh berkas cadangan seluruh konfigurasi sistem (JSON).
     */
    public function backup(Request $request, ExportSettingsAction $action): StreamedResponse
    {
        if (! $request->user()->hasRole('SuperAdmin')) {
            abort(403, 'Akses terbatas untuk SuperAdmin.');
        }

        return $action->execute($request->query('format', 'json'));
    }

    /**
     * Pulihkan pengaturan sistem dari berkas cadangan JSON.
     */
    public function restore(RestoreSettingsRequest $request, RestoreSettingsAction $action)
    {
        try {
            $count = $action->execute($request->file('file'));
            return back()->with('success', "Konfigurasi sistem berhasil dipulihkan ({$count} pengaturan diperbarui).");
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}

