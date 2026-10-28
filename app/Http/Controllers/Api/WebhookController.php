<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class WebhookController extends Controller
{
    #[OA\Post(
        path: "/api/webhooks/projects/status",
        summary: "Atualizar status de demanda via Webhook externo",
        description: "Recebe o código do projeto, tenant e o novo status. Dispara automaticamente o ciclo de automação assíncrona no Redis.",
        tags: ["Webhooks"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["tenant_id", "project_code", "status"],
            properties: [
                new OA\Property(property: "tenant_id", type: "integer", example: 1, description: "Identificador do Tenant"),
                new OA\Property(property: "project_code", type: "string", example: "DEM-F21BB", description: "Código da Demanda (ou ID numérico)"),
                new OA\Property(
                    property: "status",
                    type: "string",
                    enum: ["Aguardando", "Planejamento", "Em Andamento", "Em Testes", "Concluído", "Cancelado"],
                    example: "Aguardando",
                    description: "Novo status da demanda"
                ),
                new OA\Property(property: "notes", type: "string", example: "Alterado via Webhook do GitHub Actions", description: "Observações da transição")
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: "Status atualizado com sucesso e automação disparada.",
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: "success", type: "boolean", example: true),
                new OA\Property(property: "message", type: "string", example: "Status da demanda DEM-F21BB atualizado com sucesso."),
                new OA\Property(property: "project_code", type: "string", example: "DEM-F21BB"),
                new OA\Property(property: "status_antigo", type: "string", example: "Em Testes"),
                new OA\Property(property: "status_novo", type: "string", example: "Aguardando")
            ]
        )
    )]
    #[OA\Response(
        response: 404,
        description: "Demanda não encontrada para o Tenant informado."
    )]
    #[OA\Response(
        response: 422,
        description: "Erro de validação nos campos informados."
    )]
    public function updateProjectStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id'    => 'required|integer',
            'project_code' => 'required|string',
            'status'       => 'required|string|in:Aguardando,Planejamento,Em Andamento,Em Testes,Concluído,Cancelado',
            'notes'        => 'nullable|string|max:500',
        ]);

        // Consulta usando withoutGlobalScopes para não barrar requisições externas sem sessão de auth
        $project = Project::withoutGlobalScopes()
            ->where('tenant_id', $validated['tenant_id'])
            ->where(function ($query) use ($validated) {
                $query->where('code', $validated['project_code'])
                      ->orWhere('id', is_numeric($validated['project_code']) ? (int)$validated['project_code'] : 0);
            })
            ->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => "Demanda '{$validated['project_code']}' não encontrada para o Tenant {$validated['tenant_id']}."
            ], 404);
        }

        $oldStatus = $project->status;
        $newStatus = $validated['status'];

        if ($oldStatus === $newStatus) {
            return response()->json([
                'success'      => true,
                'message'      => "O status informado já é '{$newStatus}'. Nenhuma ação disparada.",
                'project_code' => $project->code ?? "ID-{$project->id}",
                'status'       => $project->status,
            ]);
        }

        // Anexa as notas no modelo para que o ProjectObserver consiga registrá-las
        $project->notes = $validated['notes'] ?? 'Atualizado via Webhook/Swagger';

        // Atualiza a demanda -> O ProjectObserver é acionado automaticamente pelo Eloquent
        $project->status = $newStatus;
        $project->save();

        // Registra o log de auditoria da chamada de API
        DB::table('audit_logs')->insert([
            'tenant_id'   => $project->tenant_id ?? $validated['tenant_id'],
            'user_id'     => null,
            'user_name'   => 'Swagger / Webhook Externo',
            'route_name'  => 'api.webhooks.project.status',
            'url'         => $request->fullUrl(),
            'method'      => 'POST',
            'action'      => 'WebhookController@updateProjectStatus',
            'payload'     => json_encode([
                'project_code' => $project->code ?? "ID-{$project->id}",
                'from'         => $oldStatus,
                'to'           => $newStatus,
                'notes'        => $validated['notes'] ?? 'Atualizado via Swagger/Webhook',
                'ip'           => $request->ip(),
            ]),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return response()->json([
            'success'      => true,
            'message'      => "Status da demanda '{$project->title}' atualizado de '{$oldStatus}' para '{$newStatus}' com sucesso via Webhook.",
            'project_code' => $project->code ?? "ID-{$project->id}",
            'status_antigo'=> $oldStatus,
            'status_novo'  => $newStatus,
        ], 200);
    }
}