<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowAction extends Model
{
    protected $fillable = [
        'workflow_id',
        'action_type',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array', // Converte automaticamente o JSON do PostgreSQL em array PHP
    ];

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }
}