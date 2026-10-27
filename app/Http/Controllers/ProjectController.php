<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Lista projetos filtrados automaticamente pelo BelongsToTenant.
     */
    public function index(): Response
    {
        $projects = Project::with('statusLogs')
            ->latest()
            ->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Cria a demanda vinculando o tenant via Trait e disparando o Observer.
     */
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

        Project::create($validated);

        return redirect()->back()->with('message', 'Demanda criada com sucesso!');
    }

    /**
     * Atualiza o status da demanda e dispara o ProjectObserver@updated.
     */
    public function updateStatus(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status'         => 'required|string',
            'developer_name' => 'nullable|string|max:255',
            'description'    => 'nullable|string',
            'notes'          => 'nullable|string|max:255',
        ]);

        $project->update([
            'status'         => $validated['status'],
            'developer_name' => $validated['developer_name'] ?? $project->developer_name,
            'description'    => $validated['description'] ?? $project->description,
        ]);

        return redirect()->back()->with('message', 'Demanda atualizada com sucesso!');
    }
}