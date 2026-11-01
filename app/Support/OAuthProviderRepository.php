<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Crypt;
use Throwable;

class OAuthProviderRepository
{
    /**
     * Ambil semua provider OAuth beserta secret yang didekripsi di memori.
     */
    public static function all(): array
    {
        $raw = Setting::get('oauth_providers');

        if (! is_array($raw)) {
            $raw = [
                'google' => [
                    'id' => 'google',
                    'name' => 'Google',
                    'driver' => 'google',
                    'client_id' => (string) Setting::get('oauth.google.client_id', env('GOOGLE_CLIENT_ID', '')),
                    'client_secret' => Setting::get('oauth.google.client_secret')
                        ?: (env('GOOGLE_CLIENT_SECRET') ? Crypt::encryptString(env('GOOGLE_CLIENT_SECRET')) : null),
                    'is_active' => (bool) Setting::get('auth.google', (bool) env('GOOGLE_CLIENT_ID')),
                    'created_at' => now()->toISOString(),
                ],
                'github' => [
                    'id' => 'github',
                    'name' => 'GitHub',
                    'driver' => 'github',
                    'client_id' => (string) Setting::get('oauth.github.client_id', env('GITHUB_CLIENT_ID', '')),
                    'client_secret' => Setting::get('oauth.github.client_secret')
                        ?: (env('GITHUB_CLIENT_SECRET') ? Crypt::encryptString(env('GITHUB_CLIENT_SECRET')) : null),
                    'is_active' => (bool) Setting::get('auth.github', (bool) env('GITHUB_CLIENT_ID')),
                    'created_at' => now()->toISOString(),
                ],
            ];
        }

        $result = [];
        foreach ($raw as $key => $p) {
            $decryptedSecret = null;
            if (! empty($p['client_secret'])) {
                try {
                    $decryptedSecret = Crypt::decryptString($p['client_secret']);
                } catch (Throwable) {
                    $decryptedSecret = null;
                }
            }
            $p['client_secret'] = $decryptedSecret;
            $result[$key] = $p;
        }

        return $result;
    }

    /**
     * Ambil daftar provider dengan masking secret untuk UI aman.
     */
    public static function getPublicProviders(): array
    {
        $providers = static::all();
        $public = [];

        foreach ($providers as $id => $p) {
            $hasSecret = ! empty($p['client_secret']);
            $p['client_secret'] = $hasSecret ? '••••••••••••••••' : '';
            $p['has_secret'] = $hasSecret;
            $public[] = $p;
        }

        return array_values($public);
    }

    /**
     * Ambil provider yang sedang aktif untuk halaman Login / Register.
     */
    public static function getActiveProviders(): array
    {
        $providers = static::all();
        $active = [];

        foreach ($providers as $id => $p) {
            if (! empty($p['is_active'])) {
                $active[] = [
                    'id' => $p['id'],
                    'name' => $p['name'],
                    'driver' => $p['driver'],
                ];
            }
        }

        return array_values($active);
    }

    /**
     * Cari provider berdasarkan ID unik.
     */
    public static function find(string $id): ?array
    {
        $providers = static::all();

        return $providers[$id] ?? null;
    }

    /**
     * Simpan atau perbarui provider OAuth terenkripsi.
     */
    public static function save(string $id, array $data): void
    {
        $current = static::all();
        $existing = $current[$id] ?? null;

        $secret = $data['client_secret'] ?? null;
        $finalEncryptedSecret = null;

        if (! empty($secret) && ! str_contains($secret, '•') && ! str_contains($secret, '*')) {
            $finalEncryptedSecret = Crypt::encryptString($secret);
        } elseif ($existing && ! empty($existing['client_secret'])) {
            $finalEncryptedSecret = Crypt::encryptString($existing['client_secret']);
        }

        $entry = [
            'id' => $id,
            'name' => $data['name'] ?? ucfirst($id),
            'driver' => $data['driver'] ?? $id,
            'client_id' => $data['client_id'] ?? '',
            'client_secret' => $finalEncryptedSecret,
            'is_active' => (bool) ($data['is_active'] ?? false),
            'created_at' => $existing['created_at'] ?? now()->toISOString(),
            'updated_at' => now()->toISOString(),
        ];

        $all = Setting::all();
        $storedProviders = $all['oauth_providers'] ?? [];
        $storedProviders[$id] = $entry;

        if (in_array($entry['driver'], ['google', 'github'])) {
            $all["auth.{$entry['driver']}"] = $entry['is_active'];
            $all["oauth.{$entry['driver']}.client_id"] = $entry['client_id'];
            if ($finalEncryptedSecret) {
                $all["oauth.{$entry['driver']}.client_secret"] = $finalEncryptedSecret;
            }
        }

        $all['oauth_providers'] = $storedProviders;

        $path = storage_path('app/settings.json');
        file_put_contents($path, json_encode($all, JSON_PRETTY_PRINT), LOCK_EX);
        \Illuminate\Support\Facades\Cache::forget('app_settings');
    }

    /**
     * Hapus provider OAuth dari penyimpanan.
     */
    public static function delete(string $id): void
    {
        $all = Setting::all();
        $stored = $all['oauth_providers'] ?? [];

        if (isset($stored[$id])) {
            $driver = $stored[$id]['driver'] ?? $id;
            unset($stored[$id]);
            $all['oauth_providers'] = $stored;

            if (in_array($driver, ['google', 'github'])) {
                $all["auth.{$driver}"] = false;
            }

            $path = storage_path('app/settings.json');
            file_put_contents($path, json_encode($all, JSON_PRETTY_PRINT), LOCK_EX);
            \Illuminate\Support\Facades\Cache::forget('app_settings');
        }
    }

    /**
     * Toggle status aktif/nonaktif provider.
     */
    public static function toggle(string $id): bool
    {
        $providers = static::all();
        if (! isset($providers[$id])) {
            return false;
        }

        $newState = ! (bool) ($providers[$id]['is_active'] ?? false);
        $providers[$id]['is_active'] = $newState;
        static::save($id, $providers[$id]);

        return $newState;
    }

    /**
     * Konfigurasi runtime config Socialite untuk suatu provider.
     */
    public static function configureSocialite(string $providerId): string
    {
        $provider = static::find($providerId);

        abort_unless($provider && ! empty($provider['is_active']), 404);

        $driver = $provider['driver'] ?? $providerId;
        $supportedDrivers = ['google', 'github', 'gitlab', 'bitbucket', 'slack', 'facebook'];
        abort_unless(in_array($driver, $supportedDrivers), 404);

        $clientId = $provider['client_id'] ?? '';
        $clientSecret = $provider['client_secret'] ?? '';

        if (! empty($clientId)) {
            config(["services.{$driver}.client_id" => $clientId]);
        }

        if (! empty($clientSecret)) {
            config(["services.{$driver}.client_secret" => $clientSecret]);
        }

        config(["services.{$driver}.redirect" => url("/oauth/{$providerId}/callback")]);

        return $driver;
    }
}

