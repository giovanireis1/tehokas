<?php

namespace App\Observers;

use App\Models\Project;
use App\Models\ProjectStatusLog;
use App\Services\WorkflowEngineService;
use Illuminate\Support\Facades\Auth;

class ProjectObserver
{
    public function created(Project $project): void
    {
        // Grava o primeiro registro do histórico na criação
        ProjectStatusLog::create([
            'tenant_id'   => $project->tenant_id,
            'project_id'  => $project->id,
            'user_id'     => Auth::id(),
            'status_from' => null,
            'status_to'   => $project->status,
            'notes'       => 'Demanda cadastrada no sistema.',
        ]);

        // 2. Disparo do Motor de Automação (Integração com Redis Cache & Queue)
        app(WorkflowEngineService::class)->trigger('projeto_criado', [
            'tenant_id'    => $project->tenant_id,
            'project_id'   => $project->id,
            'title'        => $project->title,
            'status_novo'  => $project->status,
            'gestor_email' => $project->manager_email,
            'usuario_nome' => Auth::user()?->name ?? 'Sistema',
        ]);
    }

    public function updated(Project $project): void
    {
        if ($project->wasChanged('status')) {
            $oldStatus = $project->getOriginal('status');
            $newStatus = $project->status;

            // Resolve a observação verificando a propriedade no modelo, no request ou recorrendo ao padrão
            $notes = $project->notes 
                ?? (request()->has('notes') ? request('notes') : null) 
                ?? "Status alterado de {$oldStatus} para {$newStatus}.";

            // 1. Auditoria de Histórico
            ProjectStatusLog::create([
                'tenant_id'   => $project->tenant_id,
                'project_id'  => $project->id,
                'user_id'     => Auth::id(),
                'status_from' => $oldStatus,
                'status_to'   => $newStatus,
                'notes'       => $notes,
            ]);

            // 2. Disparo do Motor de Automação
            app(WorkflowEngineService::class)->trigger('status_projeto_alterado', [
                'tenant_id'     => $project->tenant_id,
                'project_id'    => $project->id,
                'title'         => $project->title,
                'status_antigo' => $oldStatus,
                'status_novo'   => $newStatus,
                'gestor_email'  => $project->manager_email,
                'usuario_nome'  => Auth::user()?->name ?? 'Sistema',
            ]);
        }
    }
}