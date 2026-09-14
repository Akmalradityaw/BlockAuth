<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\AuthenticateUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
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

        $action->execute(
            $data['email'],
            $data['password'],
            (bool) ($data['remember'] ?? false)
        );

        $request->session()->regenerate();

        return redirect()
            ->intended(route('dashboard'))
            ->with('success', 'Selamat datang kembali!');
    }

    public function destroy(Request $request)
    {
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
            'google' => Setting::get('auth.google'),
            'github' => Setting::get('auth.github'),
        ];
    }
}
