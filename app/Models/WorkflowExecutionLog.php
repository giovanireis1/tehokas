<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowExecutionLog extends Model
{
    protected $fillable = [
        'workflow_id',
        'tenant_id',
        'event_name', // <-- Deve estar presente aqui!
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