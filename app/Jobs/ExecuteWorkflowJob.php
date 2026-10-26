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

    public $workflow;
    public array $payload;

    /**
     * Create a new job instance.
     */
    public function __construct($workflow, array $payload)
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
        Log::info("⚙️ [WORKFLOW] Executando Job para o Workflow ID: {$this->workflow->id}");

        // 1. Avalia as condições dinâmicas
        if (!$this->evaluateConditions()) {
            Log::warning("⚠️ [WORKFLOW] Condições não atendidas para o Workflow ID: {$this->workflow->id}. Cancelando execução.");
            
            $this->logExecution('skipped', 'Condições não atendidas para os dados do evento.');
            return;
        }

        // 2. Executa as ações vinculadas (Simulação em arquivo .txt)
        $this->executeActions();
    }

    /**
     * Avalia as condições com suporte a arrays de status em JSON e fallback de chaves
     */
    private function evaluateConditions(): bool
    {
        if (!$this->workflow->conditions || $this->workflow->conditions->isEmpty()) {
            return true;
        }

        foreach ($this->workflow->conditions as $condition) {
            // Mapeia tanto 'status' quanto 'status_novo' caso a condição monitore o status do projeto
            $fieldValue = $this->payload[$condition->field] 
                ?? $this->payload['status_novo'] 
                ?? $this->payload['status'] 
                ?? null;

            // Suporta valor string simples ou array vindo do JSON do banco
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
     * Executa o envio simulado gravando em storage/logs/simulacao_emails.txt
     */
   /* private function executeActions(): void
    {
        foreach ($this->workflow->actions as $action) {
            if ($action->action_type === 'send_email') {
                $payload = is_string($action->payload) 
                    ? json_decode($action->payload, true) 
                    : (array) $action->payload;

                $emails = $payload['emails'] ?? [$payload['to_email'] ?? null];
                $emails = array_filter((array) $emails);

                if (empty($emails)) {
                    Log::error("❌ [WORKFLOW] Nenhum e-mail de destino configurado para a ação.");
                    continue;
                }

                $filePath = storage_path('logs/simulacao_emails.txt');

                foreach ($emails as $recipient) {
                    $timestamp = now()->toDateTimeString();
                    $conteudoSimulado = "=====================================================\n"
                        . "DATA/HORA: {$timestamp}\n"
                        . "WORKFLOW ID: {$this->workflow->id} ({$this->workflow->name})\n"
                        . "DESTINATÁRIO: {$recipient}\n"
                        . "ASSUNTO: [Alerta de Demanda] Atualização no Projeto: " . ($this->payload['title'] ?? 'N/A') . "\n"
                        . "PAYLOAD DO EVENTO:\n" . json_encode($this->payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n"
                        . "=====================================================\n\n";

                    // Grava no arquivo simulando o envio
                    File::append($filePath, $conteudoSimulado);

                    Log::info("📧 [SIMULAÇÃO DE EMAIL] Gravado em txt para: {$recipient}");
                }

                $this->logExecution('success', 'E-mail simulado com sucesso em storage/logs/simulacao_emails.txt para: ' . implode(', ', $emails));
            }
        }
    }*/

        /**
     * Executa as ações vinculadas ao workflow com tratamento de exceções
     */
   private function executeActions(): void
    {
        foreach ($this->workflow->actions as $action) {
            if ($action->action_type === 'send_email') {
                // Converte payload caso o model não esteja com cast de array/json
                $actionPayload = is_array($action->payload) 
                    ? $action->payload 
                    : json_decode($action->payload ?? '[]', true);

                $recipients = $actionPayload['emails'] ?? [];

                // Contingência caso não haja e-mails na action
                if (empty($recipients) && !empty($this->payload['gestor_email'])) {
                    $recipients = [$this->payload['gestor_email']];
                }

                foreach ($recipients as $recipient) {
                    try {
                        Mail::to($recipient)->send(
                            new WorkflowAlertMail($this->payload ?? [], $this->workflow->name ?? 'Automação')
                        );

                        $this->logExecution(
                            'success',
                            "E-mail disparado com sucesso para: {$recipient}"
                        );
                    } catch (\Throwable $e) {
                        $this->logExecution(
                            'failed',
                            "Falha ao enviar e-mail para {$recipient}: " . substr($e->getMessage(), 0, 250)
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
        // Garante que event_name venha do workflow, ou deduz pelo payload, ou usa fallback
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
    }
}