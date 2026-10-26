<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'user_name',
        'route_name',
        'url',
        'method',
        'action',
        'payload',
        'ip_address',
    ];

    protected $casts = [
        'payload' => 'array',
    ];
}