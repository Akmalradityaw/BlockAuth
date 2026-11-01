<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\ManageOAuthProviderAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreOAuthProviderRequest;
use App\Http\Requests\Settings\UpdateOAuthProviderRequest;
use Illuminate\Support\Facades\Gate;

class OAuthProviderController extends Controller
{
    /**
     * Tambahkan provider OAuth baru.
     */
    public function store(StoreOAuthProviderRequest $request, ManageOAuthProviderAction $action)
    {
        $action->create($request->validated(), $request->user());

        return back()->with('success', 'Provider OAuth baru berhasil ditambahkan.');
    }

    /**
     * Perbarui konfigurasi provider OAuth.
     */
    public function update(string $id, UpdateOAuthProviderRequest $request, ManageOAuthProviderAction $action)
    {
        $action->update($id, $request->validated(), $request->user());

        return back()->with('success', "Provider OAuth {$id} berhasil diperbarui.");
    }

    /**
     * Beralih status aktif/nonaktif provider OAuth.
     */
    public function toggle(string $id, ManageOAuthProviderAction $action)
    {
        Gate::authorize('settings:manage');

        $active = $action->toggle($id, request()->user());
        $text = $active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Provider OAuth {$id} berhasil {$text}.");
    }

    /**
     * Hapus provider OAuth dari sistem.
     */
    public function destroy(string $id, ManageOAuthProviderAction $action)
    {
        Gate::authorize('settings:manage');

        $action->delete($id, request()->user());

        return back()->with('success', "Provider OAuth {$id} berhasil dihapus.");
    }
}

