<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /*

        lista projetos e envia para Projects/Index
    */

    public function index(): Response
    {
        $projects = Project::where('tenant_id', Auth::user()->tenant_id)
            ->with('statusLogs')
            ->latest()
            ->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'applicant'      => 'required|string|max:255',
            'manager_email'  => 'required|email|max:255',
            'developer_name' => 'nullable|string|max:255',
            'priority'       => 'required|string',
            'status'         => 'required|string',
            'start_date'     => 'required|date',
            'due_date'       => 'required|date|after_or_equal:start_date',
            'git_link'       => 'nullable|url|max:255',
            'description'    => 'nullable|string',
        ]);
        /*
        * Ao criar o registro, o Eloquent dispara o evento 'created', 
        * que é capturado pelo ProjectObserver (registrado no AppServiceProvider).
        * O Observer grava o histórico/log e dispara o WorkflowEngineService.
        */
        Project::create($validated);

        return redirect()->back()->with('message', 'Demanda criada com sucesso!');
    }

    public function updateStatus(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status'         => 'required|string',
            'developer_name' => 'nullable|string|max:255',
            'description'    => 'nullable|string',
            'notes'          => 'nullable|string|max:255',
        ]);

         /*
                * Ao atualizar  o registro, o Eloquent dispara o evento 'updated', 
                * que é capturado pelo ProjectObserver (registrado no AppServiceProvider).
                * O Observer grava o histórico/log e dispara o WorkflowEngineService.
        */
        $project->update([
            'status'         => $validated['status'],
            'developer_name' => $validated['developer_name'] ?? $project->developer_name,
            'description'    => $validated['description'] ?? $project->description,
        ]);

        return redirect()->back()->with('message', 'Demanda atualizada com sucesso!');
    }
}