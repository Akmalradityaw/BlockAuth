<?php

namespace App\Models;

use Illuminate\Support\Facades\File;

class Setting
{
    protected static function path(): string
    {
        return storage_path('app/settings.json');
    }

    protected static function all(): array
    {
        $path = static::path();

        if (! File::exists($path)) {
            return [];
        }

        return json_decode(File::get($path), true) ?? [];
    }

    public static function get(string $key, bool|string $default = true): bool|string
    {
        return static::all()[$key] ?? $default;
    }

    public static function set(string $key, bool|string $value): void
    {
        // ponytail: file write without lock; add Cache::lock if concurrent writes matter.
        File::put(static::path(), json_encode(
            array_merge(static::all(), [$key => $value]),
            JSON_PRETTY_PRINT
        ));
    }
}
