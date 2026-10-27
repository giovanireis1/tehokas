<?php

namespace App\Jobs;

use App\Models\Workflow;
use App\Models\WorkflowExecutionLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use App\Mail\WorkflowAlertMail;
use Illuminate\Support\Facades\Mail;

class ExecuteWorkflowJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Se o Model do Workflow foi apagado do banco antes de o job rodar,
     * o Laravel simplesmente descarta o job em vez de marcar FAIL.
     */
    public bool $deleteWhenMissingModels = true;

    public $workflow;
    public array $payload;

    /**
     * Create a new job instance.
     */
    public function __construct($workflow, array $payload = [])
    {
        if (is_array($workflow)) {
            $this->workflow = Workflow::hydrate([$workflow])->first();
            
            if (isset($workflow['conditions'])) {
                $this->workflow->setRelation('conditions', collect($workflow['conditions']));
            }
            if (isset($workflow['actions'])) {
                $this->workflow->setRelation('actions', collect($workflow['actions']));
            }
        } else {
            $this->workflow = $workflow;
        }

        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Trava de segurança 1: Se o workflow for nulo ou não possuir ID, finaliza sem erro
        if (!$this->workflow || empty($this->workflow->id)) {
            Log::info("ℹ️ [WORKFLOW] Job ignorado: Workflow inexistente ou sem ID válido.");
            return;
        }

        Log::info("⚙️ [WORKFLOW] Executando Job para o Workflow ID: {$this->workflow->id}");

        // 1. Avalia as condições dinâmicas
        if (!$this->evaluateConditions()) {
            Log::warning("⚠️ [WORKFLOW] Condições não atendidas para o Workflow ID: {$this->workflow->id}. Cancelando execução.");
            
            $this->logExecution('skipped', 'Condições não atendidas para os dados do evento.');
            return;
        }

        // 2. Executa as ações vinculadas
        $this->executeActions();
    }

    /**
     * Avalia as condições com suporte a arrays de status em JSON e fallback de chaves
     */
    private function evaluateConditions(): bool
    {
        if (empty($this->workflow->conditions) || $this->workflow->conditions->isEmpty()) {
            return true;
        }

        foreach ($this->workflow->conditions as $condition) {
            $fieldValue = $this->payload[$condition->field] 
                ?? $this->payload['status_novo'] 
                ?? $this->payload['status'] 
                ?? null;

            $rawValues = $condition->value;
            if (is_string($rawValues)) {
                $decoded = json_decode($rawValues, true);
                $allowedValues = is_array($decoded) ? $decoded : [$rawValues];
            } else {
                $allowedValues = (array) $rawValues;
            }

            $matched = match ($condition->operator) {
                'in', 'equals' => in_array($fieldValue, $allowedValues),
                'contains'     => str_contains((string) $fieldValue, implode(',', $allowedValues)),
                default        => false,
            };

            if (!$matched) {
                Log::warning("⚠️ [WORKFLOW] Condição falhou no campo '{$condition->field}'. Valor do projeto: '{$fieldValue}' | Esperados: " . json_encode($allowedValues));
                return false;
            }
        }

        return true;
    }

    /**
     * Executa as ações vinculadas ao workflow com tratamento de exceções
     */
   /**
     * Executa as ações vinculadas ao workflow com tratamento de exceções
     */
    private function executeActions(): void
    {
        if (empty($this->workflow->actions) || $this->workflow->actions->isEmpty()) {
            Log::info("ℹ️ [WORKFLOW] Nenhuma ação configurada para o Workflow ID: {$this->workflow->id}.");
            return;
        }

        foreach ($this->workflow->actions as $action) {
            if ($action->action_type === 'send_email') {
                $actionPayload = is_array($action->payload) 
                    ? $action->payload 
                    : json_decode($action->payload ?? '[]', true);

                $rawRecipients = $actionPayload['emails'] ?? [];

                // Se não houver destinatários na ação, usa o e-mail do gestor como fallback
                if (empty($rawRecipients) && !empty($this->payload['gestor_email'])) {
                    $rawRecipients = [$this->payload['gestor_email']];
                }

                // Normaliza a lista quebrando por vírgula (,) ou ponto e vírgula (;)
                $recipients = [];
                foreach ((array) $rawRecipients as $entry) {
                    $splitEmails = preg_split('/[;,]/', (string) $entry);
                    foreach ($splitEmails as $email) {
                        $trimmed = trim($email);
                        if (filter_var($trimmed, FILTER_VALIDATE_EMAIL)) {
                            $recipients[] = $trimmed;
                        }
                    }
                }
                $recipients = array_values(array_unique($recipients));

                if (empty($recipients)) {
                    Log::info("ℹ️ [WORKFLOW] Nenhum e-mail de destino válido encontrado para a ação. Ignorando envio.");
                    $this->logExecution('skipped', 'Nenhum destinatário de e-mail válido encontrado para envio.');
                    continue;
                }

                if (!empty($recipients)) {
                    try {
                        // Envia para o primeiro destinatário e coloca os demais em cópia (Cc) ou passa o array direto
                        Mail::to($recipients)->send(
                            new WorkflowAlertMail(
                                $this->payload ?? [],
                                $this->workflow->name ?? 'Automação',
                                implode(', ', $recipients)
                            )
                        );

                        $this->logExecution(
                            'success',
                            'E-mails disparados com sucesso para: ' . implode(', ', $recipients)
                        );
                    } catch (\Throwable $e) {
                        $this->logExecution(
                            'failed',
                            'Falha ao enviar e-mails: ' . substr($e->getMessage(), 0, 250)
                        );
                    }
                }
            }
        }
    }

    /**
     * Grava o histórico de execução na tabela workflow_execution_logs
     */
    private function logExecution(string $status, string $message): void
    {
        if (empty($this->workflow->id)) {
            return;
        }

        try {
            $eventName = $this->workflow->trigger_event 
                ?? (isset($this->payload['status_antigo']) ? 'status_projeto_alterado' : 'projeto_criado');

            WorkflowExecutionLog::create([
                'workflow_id' => $this->workflow->id,
                'tenant_id'   => $this->workflow->tenant_id ?? ($this->payload['tenant_id'] ?? 1),
                'event_name'  => $eventName,
                'status'      => $status,
                'message'     => $message,
                'payload'     => $this->payload,
            ]);
        } catch (\Throwable $e) {
            Log::error("❌ [WORKFLOW] Erro ao gravar execution log: " . $e->getMessage());
        }
    }
}