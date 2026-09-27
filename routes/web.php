<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ApiTokenController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PasskeyController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

require __DIR__ . '/auth.php';

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('/privacy', function () {
    return Inertia::render('Legal/Privacy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('Legal/Terms');
})->name('terms');


Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.updateRole');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('/roles/permissions', [RolePermissionController::class, 'index'])->name('roles.permissions');
    Route::put('/roles/permissions', [RolePermissionController::class, 'update'])->name('roles.permissions.update');

    // 1. Organisasi & Tim
    Route::get('/organizations', [\App\Http\Controllers\OrganizationController::class, 'index'])->name('organizations.index');
    Route::post('/organizations', [\App\Http\Controllers\OrganizationController::class, 'store'])->name('organizations.store');
    Route::put('/organizations/{organization}', [\App\Http\Controllers\OrganizationController::class, 'update'])->name('organizations.update');
    Route::delete('/organizations/{organization}', [\App\Http\Controllers\OrganizationController::class, 'destroy'])->name('organizations.destroy');
    Route::post('/organizations/{organization}/members', [\App\Http\Controllers\OrganizationController::class, 'addMember'])->name('organizations.members.store');
    Route::delete('/organizations/{organization}/members/{user}', [\App\Http\Controllers\OrganizationController::class, 'removeMember'])->name('organizations.members.destroy');

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/toggle', [SettingsController::class, 'toggle'])->name('settings.toggle');
    Route::put('/settings/banner', [SettingsController::class, 'banner'])->name('settings.banner');
    Route::put('/settings/password-policy', [SettingsController::class, 'passwordPolicy'])->name('settings.password-policy');
    Route::put('/settings/brute-force', [SettingsController::class, 'bruteForce'])->name('settings.brute-force');

    // 5. Template Email Sistem
    Route::get('/settings/email-templates', [\App\Http\Controllers\EmailTemplateController::class, 'index'])->name('settings.email-templates.index');
    Route::put('/settings/email-templates/{emailTemplate}', [\App\Http\Controllers\EmailTemplateController::class, 'update'])->name('settings.email-templates.update');
    Route::post('/settings/email-templates/{emailTemplate}/reset', [\App\Http\Controllers\EmailTemplateController::class, 'reset'])->name('settings.email-templates.reset');
    Route::post('/settings/email-templates/{emailTemplate}/test', [\App\Http\Controllers\EmailTemplateController::class, 'sendTest'])->name('settings.email-templates.test');

    Route::get('/security/ip-rules', [\App\Http\Controllers\IpRuleController::class, 'index'])->name('security.ip-rules.index');
    Route::post('/settings/ip-rules', [\App\Http\Controllers\IpRuleController::class, 'store'])->name('settings.ip-rules.store');
    Route::delete('/settings/ip-rules/{ipRule}', [\App\Http\Controllers\IpRuleController::class, 'destroy'])->name('settings.ip-rules.destroy');
    Route::post('/settings/ip-rules/{ipRule}/toggle', [\App\Http\Controllers\IpRuleController::class, 'toggle'])->name('settings.ip-rules.toggle');

    Route::get('/security/sessions', [SessionController::class, 'globalIndex'])->name('security.sessions.index');
    Route::delete('/security/sessions/{id}', [SessionController::class, 'adminDestroy'])->name('security.sessions.destroy');

    // 3. Tiket Permohonan & Insiden Keamanan
    Route::get('/security/tickets', [\App\Http\Controllers\SecurityTicketController::class, 'index'])->name('security.tickets.index');
    Route::post('/security/tickets', [\App\Http\Controllers\SecurityTicketController::class, 'store'])->name('security.tickets.store');
    Route::post('/security/tickets/{securityTicket}/reply', [\App\Http\Controllers\SecurityTicketController::class, 'reply'])->name('security.tickets.reply');
    Route::put('/security/tickets/{securityTicket}/status', [\App\Http\Controllers\SecurityTicketController::class, 'updateStatus'])->name('security.tickets.status');
    Route::delete('/security/tickets/{securityTicket}', [\App\Http\Controllers\SecurityTicketController::class, 'destroy'])->name('security.tickets.destroy');

    // 4. Kebijakan Akses Kontekstual & Geofencing
    Route::get('/security/policies', [\App\Http\Controllers\AccessPolicyController::class, 'index'])->name('security.policies.index');
    Route::post('/security/policies', [\App\Http\Controllers\AccessPolicyController::class, 'store'])->name('security.policies.store');
    Route::put('/security/policies/{accessPolicy}', [\App\Http\Controllers\AccessPolicyController::class, 'update'])->name('security.policies.update');
    Route::post('/security/policies/{accessPolicy}/toggle', [\App\Http\Controllers\AccessPolicyController::class, 'toggle'])->name('security.policies.toggle');
    Route::delete('/security/policies/{accessPolicy}', [\App\Http\Controllers\AccessPolicyController::class, 'destroy'])->name('security.policies.destroy');

    Route::get('/developer/webhooks', [\App\Http\Controllers\WebhookController::class, 'index'])->name('developer.webhooks.index');
    Route::post('/settings/webhooks', [\App\Http\Controllers\WebhookController::class, 'store'])->name('settings.webhooks.store');
    Route::delete('/settings/webhooks/{webhook}', [\App\Http\Controllers\WebhookController::class, 'destroy'])->name('settings.webhooks.destroy');
    Route::post('/settings/webhooks/{webhook}/ping', [\App\Http\Controllers\WebhookController::class, 'ping'])->name('settings.webhooks.ping');
    Route::post('/settings/webhooks/{webhook}/toggle', [\App\Http\Controllers\WebhookController::class, 'toggle'])->name('settings.webhooks.toggle');

    // 2. Klien OAuth & Developer Apps
    Route::get('/developer/oauth-clients', [\App\Http\Controllers\OAuthClientController::class, 'index'])->name('developer.oauth-clients.index');
    Route::post('/developer/oauth-clients', [\App\Http\Controllers\OAuthClientController::class, 'store'])->name('developer.oauth-clients.store');
    Route::put('/developer/oauth-clients/{oauthClient}', [\App\Http\Controllers\OAuthClientController::class, 'update'])->name('developer.oauth-clients.update');
    Route::post('/developer/oauth-clients/{oauthClient}/regenerate-secret', [\App\Http\Controllers\OAuthClientController::class, 'regenerateSecret'])->name('developer.oauth-clients.regenerate-secret');
    Route::post('/developer/oauth-clients/{oauthClient}/toggle', [\App\Http\Controllers\OAuthClientController::class, 'toggle'])->name('developer.oauth-clients.toggle');
    Route::delete('/developer/oauth-clients/{oauthClient}', [\App\Http\Controllers\OAuthClientController::class, 'destroy'])->name('developer.oauth-clients.destroy');

    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
    Route::post('/announcements/{announcement}/read', [AnnouncementController::class, 'markAsRead'])->name('announcements.read');
    Route::post('/announcements/read-all', [AnnouncementController::class, 'markAllAsRead'])->name('announcements.read-all');

    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::get('/profile/export', [\App\Http\Controllers\ProfilePrivacyController::class, 'export'])->name('profile.export');
    Route::delete('/profile/delete-account', [\App\Http\Controllers\ProfilePrivacyController::class, 'destroy'])->name('profile.delete-account');
    Route::delete('/profile/sessions/{id}', [SessionController::class, 'destroy'])->name('profile.sessions.destroy');
    Route::post('/profile/sessions/revoke-others', [SessionController::class, 'destroyOther'])->name('profile.sessions.destroy-other');

    Route::post('/users/{user}/impersonate', [\App\Http\Controllers\ImpersonationController::class, 'start'])->name('users.impersonate');
    Route::post('/impersonate/leave', [\App\Http\Controllers\ImpersonationController::class, 'stop'])->name('impersonate.leave');

    Route::get('/two-factor/setup', [\App\Http\Controllers\TwoFactorController::class, 'setup'])->name('two-factor.setup');
    Route::post('/two-factor/confirm', [\App\Http\Controllers\TwoFactorController::class, 'confirm'])->name('two-factor.confirm');
    Route::post('/two-factor/recovery-codes', [\App\Http\Controllers\TwoFactorController::class, 'recoveryCodes'])->name('two-factor.recovery-codes');
    Route::post('/two-factor/recovery-codes/regenerate', [\App\Http\Controllers\TwoFactorController::class, 'regenerateRecoveryCodes'])->name('two-factor.recovery-codes.regenerate');
    Route::delete('/two-factor', [\App\Http\Controllers\TwoFactorController::class, 'disable'])->name('two-factor.disable');

    Route::post('/profile/avatar', [AvatarController::class, 'update'])->name('avatar.update');

    Route::post('/profile/tokens', [ApiTokenController::class, 'store'])->name('profile.tokens.store');
    Route::delete('/profile/tokens/{id}', [ApiTokenController::class, 'destroy'])->name('profile.tokens.destroy');

    Route::get('/passkeys/register-options', [PasskeyController::class, 'generateRegisterOptions'])->name('passkeys.register-options');
    Route::post('/passkeys/register', [PasskeyController::class, 'register'])->name('passkeys.register');
    Route::delete('/passkeys/{id}', [PasskeyController::class, 'destroy'])->name('passkeys.destroy');

    Route::put('/password', [PasswordController::class, 'update'])->name('password.change');
});
