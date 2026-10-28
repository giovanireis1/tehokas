<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'password',
        'role',
        'is_admin',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Retorna o ID do Tenant em operação no momento.
     * Se for Super Admin, respeita a sessão ativa; se for comum, usa o tenant_id fixo.
     */
    public function getCurrentTenantId(): ?int
    {
        if ($this->is_admin || $this->role === 'admin') {
            return session('active_tenant_id') ?? $this->tenant_id;
        }

        return $this->tenant_id;
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}