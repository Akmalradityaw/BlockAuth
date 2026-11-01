<?php

namespace App\Http\Controllers\User;

use App\Actions\User\BulkAssignRoleAction;
use App\Actions\User\BulkDeleteUsersAction;
use App\Actions\User\BulkVerifyUsersAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\BulkActionRequest;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class UserBulkController extends Controller
{
    /**
     * Hapus sejumlah pengguna terpilih secara massal.
     */
    public function destroy(BulkActionRequest $request, BulkDeleteUsersAction $action)
    {
        Gate::authorize('deleteAny', User::class);

        try {
            $count = $action->execute($request->validated('user_ids'), $request->user());
            return back()->with('success', "Berhasil menghapus {$count} pengguna.");
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Ubah peran sejumlah pengguna terpilih secara massal.
     */
    public function role(BulkActionRequest $request, BulkAssignRoleAction $action)
    {
        Gate::authorize('updateAny', User::class);

        $targetRole = (string) $request->validated('role');
        if ($targetRole === '') {
            return back()->with('error', 'Peran tujuan wajib dipilih.');
        }

        try {
            $count = $action->execute($request->validated('user_ids'), $targetRole, $request->user());
            return back()->with('success', "Berhasil mengubah peran {$count} pengguna menjadi {$targetRole}.");
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Tandai email sejumlah pengguna terpilih sebagai terverifikasi secara massal.
     */
    public function verify(BulkActionRequest $request, BulkVerifyUsersAction $action)
    {
        Gate::authorize('updateAny', User::class);

        $count = $action->execute($request->validated('user_ids'));
        return back()->with('success', "Berhasil memverifikasi {$count} akun pengguna.");
    }
}
