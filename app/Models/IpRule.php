<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip_address',
        'type',
        'reason',
        'created_by',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeBlacklist($query)
    {
        return $query->where('type', 'blacklist');
    }

    public function scopeWhitelist($query)
    {
        return $query->where('type', 'whitelist');
    }

    public static function isBlacklisted(string $ip): bool
    {
        return static::active()->blacklist()->where('ip_address', $ip)->exists();
    }
}
