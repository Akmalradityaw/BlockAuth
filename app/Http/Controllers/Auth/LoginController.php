<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\AuthenticateUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'authProviders' => $this->providers(),
        ]);
    }

    public function maintenance(): Response
    {
        return Inertia::render('Auth/Login', [
            'authProviders' => $this->providers(),
            'isMaintenance' => true,
        ]);
    }

    public function store(LoginRequest $request, AuthenticateUserAction $action)
    {
        $data = $request->validated();
        $remember = (bool) ($data['remember'] ?? false);

        $user = $action->execute($data['email'], $data['password']);

        if ($user->hasTwoFactorEnabled()) {
            $request->session()->put([
                'login.2fa.user_id' => $user->id,
                'login.2fa.remember' => $remember,
            ]);

            return redirect()->route('two-factor.login');
        }

        Auth::login($user, $remember);
        $request->session()->regenerate();

        \App\Models\AuditLog::record('auth:login', 'Berhasil masuk ke sistem', ['email' => $user->email], $user);

        return redirect()
            ->intended(route('dashboard'))
            ->with('success', 'Selamat datang kembali!');
    }

    public function destroy(Request $request)
    {
        \App\Models\AuditLog::record('auth:logout', 'Keluar dari sesi sistem');

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('login')
            ->with('info', 'Anda telah keluar dari akun.');
    }

    protected function providers(): array
    {
        return [
            'list' => Setting::getActiveOAuthProviders(),
            'google' => (bool) Setting::get('auth.google', false),
            'github' => (bool) Setting::get('auth.github', false),
        ];
    }
}
