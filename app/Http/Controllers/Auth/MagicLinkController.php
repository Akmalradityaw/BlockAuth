<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\SendMagicLinkAction;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MagicLinkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/MagicLink');
    }

    public function store(Request $request, SendMagicLinkAction $action): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $action->execute($request->input('email'));

        return redirect()->back()->with('status', 'Tautan masuk telah dikirim ke email Anda jika terdaftar di sistem. Silakan periksa kotak masuk atau spam.');
    }

    public function verify(Request $request, int $id, string $hash): Response|RedirectResponse
    {
        if (! $request->hasValidSignature()) {
            return redirect()->route('login')->with('warning', 'Tautan Magic Link tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.');
        }

        $user = User::findOrFail($id);

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect()->route('login')->with('warning', 'Tautan verifikasi identitas tidak cocok.');
        }

        return Inertia::render('Auth/MagicLinkConfirm', [
            'targetUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'consumeUrl' => $request->fullUrl(),
        ]);
    }

    public function consume(Request $request, int $id, string $hash): RedirectResponse
    {
        if (! $request->hasValidSignature()) {
            return redirect()->route('login')->with('warning', 'Tautan Magic Link telah kedaluwarsa.');
        }

        $user = User::findOrFail($id);

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect()->route('login')->with('warning', 'Tautan verifikasi identitas tidak cocok.');
        }

        Auth::login($user);
        $request->session()->regenerate();

        AuditLog::record(
            'auth:login_magic_link',
            "Pengguna {$user->name} ({$user->email}) berhasil login melalui Magic Link",
            ['user_id' => $user->id],
            $user
        );

        return redirect()->intended(route('dashboard'))->with('success', "Selamat datang kembali, {$user->name}!");
    }
}

