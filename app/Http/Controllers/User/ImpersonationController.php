<?php

namespace App\Http\Controllers\User;

use App\Actions\User\ImpersonateUserAction;
use App\Actions\User\StopImpersonationAction;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    public function store(Request $request, User $user, ImpersonateUserAction $action): RedirectResponse
    {
        $action->execute($request->user(), $user);

        return redirect()->route('dashboard')->with('success', "Anda sekarang masuk sebagai {$user->name}. Seluruh aksi sensitif akun target dibatasi.");
    }

    public function destroy(StopImpersonationAction $action): RedirectResponse
    {
        $action->execute();

        return redirect()->route('users.index')->with('success', 'Sesi impersonasi telah diakhiri. Anda kembali ke akun SuperAdmin.');
    }
}

