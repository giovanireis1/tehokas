<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workflow extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'trigger_event',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relacionamento com as condições do workflow
     */
    public function conditions(): HasMany
    {
        return $this->hasMany(WorkflowCondition::class);
    }

    /**
     * Relacionamento com as ações do workflow
     */
    public function actions(): HasMany
    {
        return $this->hasMany(WorkflowAction::class);
    }

    /**
     * Relacionamento com os logs de execução
     */
    public function executionLogs(): HasMany
    {
        return $this->hasMany(WorkflowExecutionLog::class);
    }
}