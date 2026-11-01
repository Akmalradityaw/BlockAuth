<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\UpdateGeneralSettingsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateGeneralSettingsRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class GeneralSettingController extends Controller
{
    /**
     * Ubah status mode pemeliharaan (maintenance mode).
     */
    public function maintenance(Request $request, UpdateGeneralSettingsAction $action)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate(['enabled' => ['required', 'boolean']]);
        $enabled = (bool) $data['enabled'];

        $action->updateMaintenance($enabled, $request->user());

        return back()->with('success', $enabled ? 'Mode pemeliharaan sistem aktif.' : 'Mode pemeliharaan nonaktif.');
    }

    /**
     * Perbarui pengumuman banner siaran darurat.
     */
    public function banner(UpdateGeneralSettingsRequest $request, UpdateGeneralSettingsAction $action)
    {
        Gate::authorize('settings:manage');

        $action->updateBanner($request->validated(), $request->user());

        return back()->with('success', 'Pengumuman banner berhasil disimpan.');
    }
}

