<?php

namespace App\Models;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class Setting
{
    protected static function path(): string
    {
        return storage_path('app/settings.json');
    }

    protected static function all(): array
    {
        return Cache::rememberForever('app_settings', function () {
            $path = static::path();
            if (! File::exists($path)) {
                return [];
            }
            return json_decode(File::get($path), true) ?? [];
        });
    }

    public static function get(string $key, mixed $default = true): mixed
    {
        return static::all()[$key] ?? $default;
    }

    public static function set(string $key, mixed $value): void
    {
        File::put(static::path(), json_encode(
            array_merge(static::all(), [$key => $value]),
            JSON_PRETTY_PRINT
        ));
        Cache::forget('app_settings');
    }
}
