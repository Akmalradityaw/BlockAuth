<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Throwable;

class AuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'description',
        'ip_address',
        'user_agent',
        'properties',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'properties' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Catat log aktivitas secara aman (tanpa mengganggu proses utama jika gagal).
     */
    public static function record(string $action, string $description, ?array $properties = null, ?User $user = null): ?self
    {
        try {
            $userId = $user ? $user->id : auth()->id();
            $ip = request()?->ip() ?? '127.0.0.1';
            $userAgent = request()?->userAgent();

            return static::create([
                'user_id' => $userId,
                'action' => $action,
                'description' => $description,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'properties' => $properties,
                'created_at' => now(),
            ]);
        } catch (Throwable $e) {
            report($e);
            return null;
        }
    }
}
