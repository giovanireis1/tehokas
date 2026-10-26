<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowCondition extends Model
{
    protected $fillable = [
        'workflow_id',
        'field',
        'operator',
        'value',
    ];

    protected $casts = [
        'value' => 'array', // Converte automaticamente o JSON do PostgreSQL em array PHP
    ];

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }
}