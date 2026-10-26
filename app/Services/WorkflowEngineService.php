<?php

namespace App\Services;

use App\Jobs\ExecuteWorkflowJob;
use App\Models\Workflow;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class WorkflowEngineService
{
    /**
     * Dispara a verificação de workflows para um determinado evento.
     */
    public function trigger(string $eventName, array $payload): void
    {
        $tenantId = $payload['tenant_id'] ?? Auth::user()?->tenant_id;

        if (!$tenantId) {
            return;
        }

        $cacheKey = "workflows_{$tenantId}_{$eventName}";

        // Buscamos apenas os IDs ou convertemos para Array para evitar serialização de objetos complexos
        $workflowsData = Cache::remember($cacheKey, 3600, function () use ($tenantId, $eventName) {
            return Workflow::where('tenant_id', $tenantId)
                ->where('trigger_event', $eventName)
                ->where('is_active', true)
                ->with(['conditions', 'actions'])
                ->get()
                ->toArray(); // Converte para Array nativo do PHP
        });

        if (empty($workflowsData)) {
            return;
        }

        // Processa os dados limpos sem dependência de desserialização de Classes
        foreach ($workflowsData as $workflowArray) {
            // Reinstancia a model apenas para o Job se necessário, ou passa o ID/Array
            $workflow = Workflow::hydrate([$workflowArray])->first();
            ExecuteWorkflowJob::dispatch($workflow, $payload);
        }
    }

    /**
     * Limpa o cache de workflows de um tenant ao salvar/atualizar uma regra.
     */
    public function clearCache(int $tenantId, string $eventName): void
    {
        Cache::forget("workflows_{$tenantId}_{$eventName}");
    }
}