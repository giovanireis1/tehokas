<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'code',
        'title',
        'applicant',
        'manager_email',
        'developer_name',
        'priority',
        'status',
        'start_date',
        'due_date',
        'git_link',
        'description',
    ];

    protected static function booted(): void
    {
        static::creating(function ($project) {
            if (Auth::check() && !$project->tenant_id) {
                $project->tenant_id = Auth::user()->tenant_id;
            }

            if (!$project->code) {
                $project->code = 'DEM-' . strtoupper(substr(uniqid(), -5));
            }
        });
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(ProjectStatusLog::class)->with('user')->latest();
    }
}