<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\UpdateModuleFeaturesAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateModuleFeaturesRequest;

class ModuleFeatureController extends Controller
{
    /**
     * Perbarui konfigurasi ketersediaan modul halaman dan branding antarmuka sistem.
     */
    public function update(UpdateModuleFeaturesRequest $request, UpdateModuleFeaturesAction $action)
    {
        $action->execute($request->validated(), $request->user());

        return back()->with('success', 'Preferensi ketersediaan modul halaman berhasil disimpan.');
    }
}

