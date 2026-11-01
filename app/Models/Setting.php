<?php

namespace App\Models;

use App\Support\OAuthProviderRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\File;
use Throwable;

class Setting
{
    protected static function path(): string
    {
        return storage_path('app/settings.json');
    }

    public static function all(): array
    {
        return Cache::rememberForever('app_settings', function () {
            $path = static::path();

            if (! File::exists($path)) {
                return [];
            }

            return json_decode(File::get($path), true) ?? [];
        });
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $all = static::all();

        return $all[$key] ?? $default;
    }

    public static function getGroup(string $group): array
    {
        $all = static::all();
        $prefix = $group . '.';
        $result = [];

        foreach ($all as $k => $v) {
            if (str_starts_with($k, $prefix)) {
                $subKey = substr($k, strlen($prefix));
                $result[$subKey] = $v;
            } elseif ($k === $group && is_array($v)) {
                $result = array_merge($result, $v);
            }
        }

        return $result;
    }

    public static function set(string $key, mixed $value): void
    {
        $path = static::path();
        $dir = dirname($path);

        if (! File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $all = static::all();
        $all[$key] = $value;

        file_put_contents($path, json_encode($all, JSON_PRETTY_PRINT), LOCK_EX);

        Cache::forget('app_settings');
    }

    public static function getEncrypted(string $key, ?string $default = null): ?string
    {
        $encrypted = static::get($key);

        if (empty($encrypted)) {
            return $default;
        }

        try {
            return Crypt::decryptString($encrypted);
        } catch (Throwable) {
            return $default;
        }
    }

    public static function setEncrypted(string $key, ?string $value): void
    {
        if (empty($value)) {
            static::set($key, null);
            return;
        }

        static::set($key, Crypt::encryptString($value));
    }

    // Delegasi backward compatibility ke OAuthProviderRepository
    public static function getOAuthProviders(): array
    {
        return OAuthProviderRepository::all();
    }

    public static function getPublicOAuthProviders(): array
    {
        return OAuthProviderRepository::getPublicProviders();
    }

    public static function getActiveOAuthProviders(): array
    {
        return OAuthProviderRepository::getActiveProviders();
    }

    public static function getOAuthProvider(string $id): ?array
    {
        return OAuthProviderRepository::find($id);
    }

    public static function saveOAuthProvider(string $id, array $data): void
    {
        OAuthProviderRepository::save($id, $data);
    }

    public static function deleteOAuthProvider(string $id): void
    {
        OAuthProviderRepository::delete($id);
    }

    public static function toggleOAuthProvider(string $id): bool
    {
        return OAuthProviderRepository::toggle($id);
    }
}
