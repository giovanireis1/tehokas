<?php

namespace App\Http\Controllers;

use App\Models\Workflow;
use App\Enums\WorkflowTrigger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    /**
     * Lista workflows do tenant com carregamento otimizado de relacionamentos.
     */
    public function index()
    {
        $workflows = Workflow::with([
            'conditions', 
            'actions', 
            'executionLogs' => fn($q) => $q->latest()
        ])
        ->latest()
        ->get();

        // Ajustado para 'Workflows/Index' conforme a convenção padrão de pastas
        return Inertia::render('Workflows/Index', [
            'workflows' => $workflows,
            'triggers'  => WorkflowTrigger::options(),
        ]);
    }

    /**
     * Criação de workflow com atomicidade transacional e invalidação de cache.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'trigger_event'         => 'required|string',
            'is_active'             => 'boolean',
            'conditions'            => 'nullable|array',
            'conditions.*.field'    => 'required|string',
            'conditions.*.operator' => 'required|string',
            'conditions.*.value'    => 'required',
            'actions'               => 'required|array|min:1',
            'actions.*.action_type' => 'required|string',
            'actions.*.payload'     => 'required|array',
        ]);

        $workflow = DB::transaction(function () use ($validated) {
            $wf = Workflow::create([
                'name'          => $validated['name'],
                'trigger_event' => $validated['trigger_event'],
                'is_active'     => $validated['is_active'] ?? true,
            ]);

            if (!empty($validated['conditions'])) {
                foreach ($validated['conditions'] as $cond) {
                    $wf->conditions()->create($cond);
                }
            }

            foreach ($validated['actions'] as $act) {
                $wf->actions()->create($act);
            }

            return $wf;
        });

        Cache::forget("workflows_{$workflow->tenant_id}_{$validated['trigger_event']}");

        return redirect()->back()->with('message', 'Workflow criado com sucesso!');
    }

    /**
     * Atualização completa de workflow sob transação atômica.
     */
    public function update(Request $request, Workflow $workflow)
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'trigger_event'         => 'required|string',
            'is_active'             => 'boolean',
            'conditions'            => 'nullable|array',
            'conditions.*.field'    => 'required|string',
            'conditions.*.operator' => 'required|string',
            'conditions.*.value'    => 'required',
            'actions'               => 'required|array|min:1',
            'actions.*.action_type' => 'required|string',
            'actions.*.payload'     => 'required|array',
        ]);

        DB::transaction(function () use ($workflow, $validated) {
            $workflow->update([
                'name'          => $validated['name'],
                'trigger_event' => $validated['trigger_event'],
                'is_active'     => $validated['is_active'] ?? true,
            ]);

            $workflow->conditions()->delete();
            if (!empty($validated['conditions'])) {
                foreach ($validated['conditions'] as $cond) {
                    $workflow->conditions()->create($cond);
                }
            }

            $workflow->actions()->delete();
            foreach ($validated['actions'] as $act) {
                $workflow->actions()->create($act);
            }
        });

        Cache::forget("workflows_{$workflow->tenant_id}_{$validated['trigger_event']}");

        return redirect()->back()->with('message', 'Workflow atualizado com sucesso!');
    }

    /**
     * Alternância rápida de status com invalidação de cache.
     */
    public function toggleActive(Workflow $workflow)
    {
        $workflow->update([
            'is_active' => !$workflow->is_active,
        ]);

        Cache::forget("workflows_{$workflow->tenant_id}_{$workflow->trigger_event}");

        return redirect()->back()->with('message', 'Status do workflow alterado!');
    }
}