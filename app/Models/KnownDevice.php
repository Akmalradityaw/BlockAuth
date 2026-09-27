<?php

namespace App\Models;

use App\Support\AgentParser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class KnownDevice extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent_hash',
        'device_name',
        'first_login_at',
        'last_login_at',
    ];

    protected function casts(): array
    {
        return [
            'first_login_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function checkAndRecord(User $user, ?Request $request = null): array
    {
        $request = $request ?? request();
        $ip = $request->ip() ?? '127.0.0.1';
        $userAgent = $request->userAgent() ?? '';

        $hash = hash('sha256', $userAgent . '|' . $ip);
        $agent = AgentParser::parse($userAgent);
        $deviceName = $agent['browser'] . ' di ' . $agent['platform'];

        $existing = static::where('user_id', $user->id)
            ->where('user_agent_hash', $hash)
            ->first();

        if ($existing) {
            $existing->update(['last_login_at' => now()]);
            return ['is_new' => false, 'device' => $existing];
        }

        // Simpan perangkat baru
        $device = static::create([
            'user_id' => $user->id,
            'ip_address' => $ip,
            'user_agent_hash' => $hash,
            'device_name' => $deviceName,
            'first_login_at' => now(),
            'last_login_at' => now(),
        ]);

        // Audit Log
        AuditLog::record(
            'auth:new_device_login',
            "Terdeteksi aktivitas masuk dari perangkat/IP baru: {$deviceName} ({$ip})",
            [
                'device_name' => $deviceName,
                'ip_address' => $ip,
                'browser' => $agent['browser'],
                'platform' => $agent['platform'],
            ],
            $user
        );

        // Buat notifikasi keamanan otomatis untuk pengguna
        Announcement::create([
            'user_id' => $user->id,
            'title' => 'Peringatan Keamanan: Login dari Perangkat Baru',
            'content' => "Akun Anda baru saja diakses dari perangkat {$deviceName} (IP: {$ip}) pada " . now()->translatedFormat('d M Y, H:i') . ". Jika ini bukan Anda, segera ubah kata sandi dan putus sesi di menu Profil > Sesi Aktif.",
            'type' => 'warning',
            'pinned' => true,
            'is_active' => true,
        ]);

        \App\Services\WebhookDispatcher::dispatch('auth.new_device', [
            'user_id' => $user->id,
            'email' => $user->email,
            'device_name' => $deviceName,
            'ip_address' => $ip,
            'timestamp' => now()->toIso8601String(),
        ]);

        return ['is_new' => true, 'device' => $device];
    }
}
