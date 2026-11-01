<?php

use App\Http\Controllers\Settings\GeneralSettingController;
use App\Http\Controllers\Settings\ModuleFeatureController;
use App\Http\Controllers\Settings\OAuthProviderController;
use App\Http\Controllers\Settings\SecurityPolicyController;
use App\Http\Controllers\Settings\SettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::match(['put', 'post'], '/settings', [ModuleFeatureController::class, 'update'])->name('settings.update');
    Route::match(['put', 'post'], '/settings/ui', [ModuleFeatureController::class, 'update'])->name('settings.ui');
    Route::match(['put', 'post'], '/settings/modules', [ModuleFeatureController::class, 'update'])->name('settings.modules');

    Route::put('/settings/maintenance', [GeneralSettingController::class, 'maintenance'])->name('settings.maintenance');
    Route::put('/settings/banner', [GeneralSettingController::class, 'banner'])->name('settings.banner');

    Route::post('/settings/oauth/providers', [OAuthProviderController::class, 'store'])->name('settings.oauth.providers.store');
    Route::put('/settings/oauth/providers/{id}', [OAuthProviderController::class, 'update'])->name('settings.oauth.providers.update');
    Route::patch('/settings/oauth/providers/{id}/toggle', [OAuthProviderController::class, 'toggle'])->name('settings.oauth.providers.toggle');
    Route::delete('/settings/oauth/providers/{id}', [OAuthProviderController::class, 'destroy'])->name('settings.oauth.providers.destroy');

    Route::put('/settings/security', [SecurityPolicyController::class, 'update'])->name('settings.security');
    Route::put('/settings/mail', [\App\Http\Controllers\Settings\MailSettingController::class, 'update'])->name('settings.mail.update');
    Route::post('/settings/mail/test', [\App\Http\Controllers\Settings\MailSettingController::class, 'test'])->name('settings.mail.test');

    Route::get('/settings/backup', [\App\Http\Controllers\Settings\SettingsBackupController::class, 'backup'])->name('settings.backup');
    Route::post('/settings/restore', [\App\Http\Controllers\Settings\SettingsBackupController::class, 'restore'])->name('settings.restore');
});

