<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowExecutionLog extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'workflow_id',
        'event_name',
        'status',
        'message',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }
}