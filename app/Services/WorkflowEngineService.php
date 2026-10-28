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

        // withoutGlobalScopes() garante isolamento estrito ao $tenantId informado,
        // funcionando tanto logado quanto via Webhook/Worker externo.
        $workflowsData = Cache::remember($cacheKey, 3600, function () use ($tenantId, $eventName) {
            return Workflow::withoutGlobalScopes()
                ->where('tenant_id', $tenantId)
                ->where('trigger_event', $eventName)
                ->where('is_active', true)
                ->with(['conditions', 'actions'])
                ->get()
                ->toArray();
        });

        if (empty($workflowsData)) {
            return;
        }

        foreach ($workflowsData as $workflowArray) {
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