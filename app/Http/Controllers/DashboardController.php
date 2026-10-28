<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectStatusLog;
use App\Models\Workflow;
use App\Models\WorkflowExecutionLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Pega o ID do tenant em operação (ativo na sessão para Super Admin ou fixo para usuário)
        $tenantId = session('active_tenant_id') ?? Auth::user()?->tenant_id;

        // 1. CARDS DE MÉTRICAS (Isolados pelo BelongsToTenant)
        $totalWorkflows = Workflow::count();
        $activeWorkflows = Workflow::where('is_active', true)->count();
        $totalProjects = Project::count();

        $totalTriggers = WorkflowExecutionLog::count();
        $totalSuccess = WorkflowExecutionLog::where('status', 'success')->count();
        $totalSkipped = WorkflowExecutionLog::where('status', 'skipped')->count();
        $totalErrors = WorkflowExecutionLog::where('status', 'failed')->count();

        // Tabelas diretas sem model: filtramos explicitamente pelo tenant_id
        $totalLogins = DB::table('authentication_logs')
            ->where('tenant_id', $tenantId)
            ->count();

        $totalAudit = DB::table('audit_logs')
            ->where('tenant_id', $tenantId)
            ->count();

        $stats = [
            'total_workflows'   => $totalWorkflows,
            'active_workflows'  => $activeWorkflows,
            'total_projects'    => $totalProjects,
            'total_triggers'    => $totalTriggers,
            'total_alerts_sent' => $totalSuccess,
            'total_skipped'     => $totalSkipped,
            'total_errors'      => $totalErrors,
            'total_logins'      => $totalLogins,
            'total_audit'       => $totalAudit,
        ];

        // 2. GRÁFICO REAL: ÚLTIMOS 7 DIAS (Isolado pelo BelongsToTenant)
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dateString = $date->toDateString();
            $label = $date->locale('pt_BR')->shortDayName;

            $daySuccess = WorkflowExecutionLog::whereDate('created_at', $dateString)
                ->where('status', 'success')
                ->count();

            $daySkipped = WorkflowExecutionLog::whereDate('created_at', $dateString)
                ->where('status', 'skipped')
                ->count();

            $dayErrors = WorkflowExecutionLog::whereDate('created_at', $dateString)
                ->where('status', 'failed')
                ->count();

            $chartData[] = [
                'day'     => ucfirst($label),
                'sucesso' => $daySuccess,
                'skipped' => $daySkipped,
                'falha'   => $dayErrors,
            ];
        }

        // 3. CANAIS / AÇÕES EXECUTADAS
        $actionDistribution = [
            [
                'type'       => 'Disparo de E-mail (Simulado/Real)',
                'count'      => $totalSuccess,
                'percentage' => $totalTriggers > 0 ? round(($totalSuccess / $totalTriggers) * 100) : 0,
                'color'      => 'bg-emerald-500',
            ],
            [
                'type'       => 'Condições Ignoradas (Skipped)',
                'count'      => $totalSkipped,
                'percentage' => $totalTriggers > 0 ? round(($totalSkipped / $totalTriggers) * 100) : 0,
                'color'      => 'bg-amber-500',
            ],
            [
                'type'       => 'Erros / Falhas',
                'count'      => $totalErrors,
                'percentage' => $totalTriggers > 0 ? round(($totalErrors / $totalTriggers) * 100) : 0,
                'color'      => 'bg-red-500',
            ],
        ];

        // 4. LOGS RECENTES DE EXECUÇÃO (Filtrado automaticamente pelo tenant)
        $recentExecutionLogs = WorkflowExecutionLog::with('workflow')
            ->latest('id')
            ->take(6)
            ->get()
            ->map(function ($log) {
                return [
                    'id'         => $log->id,
                    'workflow'   => $log->workflow->name ?? 'Workflow #' . $log->workflow_id,
                    'event'      => $log->event_name ?? 'status_projeto_alterado',
                    'status'     => $log->status,
                    'message'    => $log->message,
                    'created_at' => $log->created_at ? $log->created_at->format('d/m/Y H:i:s') : '-',
                ];
            });

        // 5. LOGS RECENTES DE ACESSO / AUDITORIA
        $recentAuditLogs = DB::table('audit_logs')
            ->where('tenant_id', $tenantId)
            ->latest('id')
            ->take(6)
            ->get()
            ->map(function ($audit) {
                return [
                    'id'         => $audit->id,
                    'user'       => $audit->user_name ?? 'Sistema',
                    'route'      => $audit->route_name ?? $audit->url,
                    'method'     => $audit->method,
                    'created_at' => Carbon::parse($audit->created_at)->format('H:i:s'),
                ];
            });

        // 6. ÚLTIMAS TRANSIÇÕES DE DEMANDAS (Usa o Model para respeitar o tenant)
        $recentStatusTransitions = ProjectStatusLog::with('project')
            ->latest('id')
            ->take(5)
            ->get()
            ->map(function ($trans) {
                return [
                    'id'            => $trans->id,
                    'project_title' => $trans->project->title ?? 'Demanda #' . $trans->project_id,
                    'from'          => $trans->status_from ?? 'Início',
                    'to'            => $trans->status_to,
                    'notes'         => $trans->notes,
                    'created_at'    => $trans->created_at ? $trans->created_at->format('H:i:s') : '-',
                ];
            });

        return Inertia::render('Dashboard', [
            'stats'                   => $stats,
            'chartData'               => $chartData,
            'actionDistribution'      => $actionDistribution,
            'recentLogs'              => $recentExecutionLogs,
            'recentAuditLogs'         => $recentAuditLogs,
            'recentStatusTransitions' => $recentStatusTransitions,
        ]);
    }
}