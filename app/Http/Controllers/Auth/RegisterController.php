<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\RegisterUserAction;
use App\DataTransferObjects\RegisterData;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'authProviders' => [
                'google' => Setting::get('auth.google'),
                'github' => Setting::get('auth.github'),
            ],
        ]);
    }

    public function store(RegisterRequest $request, RegisterUserAction $action)
    {
        $user = $action->execute(
            RegisterData::fromArray($request->validated())
        );

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()
            ->intended(route('dashboard'))
            ->with('success', "Akun berhasil dibuat. Selamat datang, {$user->name}!");
    }
}