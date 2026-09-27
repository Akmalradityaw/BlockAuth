<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ImpersonationController extends Controller
{
    /**
     * Mulai sesi impersonasi sebagai pengguna lain.
     */
    public function start(Request $request, User $user)
    {
        Gate::authorize('users:impersonate');

        if ($user->is($request->user())) {
            return back()->with('error', 'Tidak dapat mengimpersonasi akun Anda sendiri.');
        }

        if ($request->session()->has('impersonator_id')) {
            return back()->with('error', 'Anda sudah berada dalam sesi impersonasi.');
        }

        $admin = $request->user();

        $request->session()->put('impersonator_id', $admin->id);
        Auth::login($user);

        AuditLog::record(
            'impersonate:start',
            "Administrator {$admin->name} mulai mengimpersonasi akun {$user->name} ({$user->email})",
            [
                'impersonator_id' => $admin->id,
                'impersonator_email' => $admin->email,
                'target_user_id' => $user->id,
                'target_email' => $user->email,
            ]
        );

        return redirect()->route('dashboard')->with('success', "Anda sekarang masuk sebagai {$user->name}.");
    }

    /**
     * Akhiri sesi impersonasi dan kembali ke akun administrator semula.
     */
    public function stop(Request $request)
    {
        if (! $request->session()->has('impersonator_id')) {
            return redirect()->route('dashboard');
        }

        $admin = User::findOrFail($request->session()->get('impersonator_id'));
        $targetUser = $request->user();

        $request->session()->forget('impersonator_id');
        Auth::login($admin);

        AuditLog::record(
            'impersonate:stop',
            "Administrator {$admin->name} mengakhiri impersonasi akun {$targetUser?->name} dan kembali ke akun utama",
            [
                'admin_id' => $admin->id,
                'target_id' => $targetUser?->id,
            ]
        );

        return redirect()->route('users.index')->with('info', 'Sesi impersonasi berakhir. Anda telah kembali ke akun administrator.');
    }
}
