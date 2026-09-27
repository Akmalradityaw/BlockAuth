<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class OAuthClient extends Model
{
    use HasFactory;

    protected $table = 'oauth_clients';

    protected $fillable = [
        'user_id',
        'name',
        'client_id',
        'client_secret',
        'redirect_uri',
        'scopes',
        'is_active',
    ];

    protected $casts = [
        'scopes' => 'array',
        'is_active' => 'boolean',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($client) {
            if (empty($client->client_id)) {
                $client->client_id = 'ba_client_' . Str::random(24);
            }
            if (empty($client->client_secret)) {
                $client->client_secret = 'ba_sec_' . Str::random(48);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
