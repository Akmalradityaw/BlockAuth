<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\FeatureRegistry;
use App\Support\OAuthProviderRepository;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Tampilkan antarmuka manajemen pengaturan sistem.
     */
    public function index(): Response
    {
        Gate::authorize('settings:read');

        $policy = Setting::get('security.password_policy', []);

        return Inertia::render('Settings/Index', [
            'general' => [
                'maintenance' => (bool) Setting::get('maintenance.enabled', false),
                'banner_text' => (string) Setting::get('banner.text', ''),
                'banner_style' => (string) Setting::get('banner.style', 'warning'),
                'banner_enabled' => (bool) Setting::get('banner.enabled', false),
            ],
            'oauth' => [
                'providers' => OAuthProviderRepository::getPublicProviders(),
                'google_enabled' => (bool) Setting::get('auth.google', false),
                'google_client_id' => (string) Setting::get('oauth.google.client_id', ''),
                'google_has_secret' => ! empty(Setting::getEncrypted('oauth.google.client_secret')),
                'google_callback_url' => url('/oauth/google/callback'),
                'github_enabled' => (bool) Setting::get('auth.github', false),
                'github_client_id' => (string) Setting::get('oauth.github.client_id', ''),
                'github_has_secret' => ! empty(Setting::getEncrypted('oauth.github.client_secret')),
                'github_callback_url' => url('/oauth/github/callback'),
            ],
            'security' => [
                'min_length' => (int) ($policy['min_length'] ?? 8),
                'require_uppercase' => (bool) ($policy['require_uppercase'] ?? false),
                'require_numeric' => (bool) ($policy['require_numeric'] ?? false),
                'require_special_char' => (bool) ($policy['require_special_char'] ?? false),
                'check_pwned_passwords' => (bool) ($policy['check_pwned_passwords'] ?? false),
                'must_verify_email' => (bool) Setting::get('auth.must_verify_email', false),
                'max_login_attempts' => (int) Setting::get('security.max_login_attempts', 5),
                'decay_minutes' => (int) Setting::get('security.decay_minutes', 1),
            ],
            'mail' => [
                'host' => (string) Setting::get('mail.host', ''),
                'port' => (int) Setting::get('mail.port', 587),
                'encryption' => (string) Setting::get('mail.encryption', 'tls'),
                'username' => (string) Setting::get('mail.username', ''),
                'has_password' => ! empty(Setting::getEncrypted('mail.password')),
                'from_address' => (string) Setting::get('mail.from_address', ''),
                'from_name' => (string) Setting::get('mail.from_name', ''),
            ],
            'features' => FeatureRegistry::all(),
            'app' => [
                'name' => (string) Setting::get('app.name', 'BlockAuth'),
                'tagline' => (string) Setting::get('app.tagline', 'Auth dan Profil'),
                'logo_url' => (string) Setting::get('app.logo_url', ''),
                'footer_text' => (string) Setting::get('app.footer_text', '© ' . date('Y') . ' BlockAuth. All rights reserved.'),
            ],
        ]);
    }
}

