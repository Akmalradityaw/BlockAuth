<?php

use App\Http\Controllers\Profile\AvatarController;
use App\Http\Controllers\Profile\PasswordController;
use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\Profile\SessionController;
use App\Http\Controllers\Profile\TwoFactorController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [AvatarController::class, 'update'])->name('avatar.update');

    Route::middleware('prevent.impersonation')->group(function () {
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
        Route::put('/password', [PasswordController::class, 'update'])->name('password.change');

        Route::delete('/profile/sessions/{id}', [SessionController::class, 'destroy'])->name('profile.sessions.destroy');
        Route::post('/profile/sessions/revoke-others', [SessionController::class, 'destroyOther'])->name('profile.sessions.revoke-others');

        Route::get('/two-factor/setup', [TwoFactorController::class, 'setup'])->name('two-factor.setup');
        Route::post('/two-factor/confirm', [TwoFactorController::class, 'confirm'])->name('two-factor.confirm');
        Route::post('/two-factor/recovery-codes', [TwoFactorController::class, 'recoveryCodes'])->name('two-factor.recovery-codes');
        Route::post('/two-factor/recovery-codes/regenerate', [TwoFactorController::class, 'regenerateRecoveryCodes'])->name('two-factor.recovery-codes.regenerate');
        Route::delete('/two-factor', [TwoFactorController::class, 'disable'])->name('two-factor.disable');
    });
});

