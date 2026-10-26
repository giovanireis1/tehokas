<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectStatusLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'project_id',
        'user_id',
        'status_from',
        'status_to',
        'notes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}