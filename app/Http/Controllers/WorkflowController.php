<?php

namespace App\Http\Controllers;

use App\Models\Workflow;
use App\Enums\WorkflowTrigger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- Importação da Facade Auth
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    public function index()
    {
        $tenantId = Auth::user()?->tenant_id ?? 1;

        $workflows = Workflow::with([
            'conditions', 
            'actions', 
            'executionLogs' => fn($q) => $q->latest()
        ])
        ->where('tenant_id', $tenantId)
        ->latest()
        ->get();

        return Inertia::render('Workflow/Index', [
            'workflows' => $workflows,
            'triggers'  => WorkflowTrigger::options(),
        ]);
    }

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

        $tenantId = Auth::user()?->tenant_id ?? 1;

        $workflow = Workflow::create([
            'tenant_id'     => $tenantId,
            'name'          => $validated['name'],
            'trigger_event' => $validated['trigger_event'],
            'is_active'     => $validated['is_active'] ?? true,
        ]);

        if (!empty($validated['conditions'])) {
            foreach ($validated['conditions'] as $cond) {
                $workflow->conditions()->create($cond);
            }
        }

        foreach ($validated['actions'] as $act) {
            $workflow->actions()->create($act);
        }

        Cache::forget("workflows_{$tenantId}_{$validated['trigger_event']}");

        return redirect()->back()->with('message', 'Workflow criado com sucesso!');
    }

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

        $tenantId = Auth::user()?->tenant_id ?? 1;
        Cache::forget("workflows_{$tenantId}_{$validated['trigger_event']}");

        return redirect()->back()->with('message', 'Workflow atualizado com sucesso!');
    }

    public function toggleActive(Workflow $workflow)
    {
        $workflow->update([
            'is_active' => !$workflow->is_active,
        ]);

        $tenantId = Auth::user()?->tenant_id ?? 1;
        Cache::forget("workflows_{$tenantId}_{$workflow->trigger_event}");

        return redirect()->back()->with('message', 'Status do workflow alterado!');
    }
}