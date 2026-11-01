<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SocialiteController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::middleware('feature:registration')->group(function () {
        Route::get('/register', [RegisterController::class, 'create'])->name('register');
        Route::post('/register', [RegisterController::class, 'store']);
    });

    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::middleware('feature:magic_link')->group(function () {
        Route::get('/magic-link', [\App\Http\Controllers\Auth\MagicLinkController::class, 'create'])->name('magic-link.create');
        Route::post('/magic-link', [\App\Http\Controllers\Auth\MagicLinkController::class, 'store'])
            ->middleware('throttle:3,10')
            ->name('magic-link.store');
        Route::get('/magic-link/{id}/{hash}', [\App\Http\Controllers\Auth\MagicLinkController::class, 'verify'])->name('magic-link.verify');
        Route::post('/magic-link/{id}/{hash}', [\App\Http\Controllers\Auth\MagicLinkController::class, 'consume'])->name('magic-link.consume');
    });

    Route::get('/maintenance', [LoginController::class, 'maintenance'])->name('maintenance.login');

    Route::get('/two-factor-challenge', [\App\Http\Controllers\Auth\TwoFactorChallengeController::class, 'create'])
        ->name('two-factor.login');
    Route::post('/two-factor-challenge', [\App\Http\Controllers\Auth\TwoFactorChallengeController::class, 'store']);

    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->name('password.update');

    Route::get('/oauth/{provider}/redirect', [SocialiteController::class, 'redirect'])
        ->where('provider', '[a-zA-Z0-9_\-]+')
        ->name('oauth.redirect');
    Route::get('/oauth/{provider}/callback', [SocialiteController::class, 'callback'])
        ->where('provider', '[a-zA-Z0-9_\-]+')
        ->name('oauth.callback');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
});
