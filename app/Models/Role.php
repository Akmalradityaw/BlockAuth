<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected $fillable = [
        'name',
        'label',
        'description',
        'guard_name',
        'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public function getDisplayNameAttribute(): string
    {
        return $this->label ?: $this->name;
    }
}
