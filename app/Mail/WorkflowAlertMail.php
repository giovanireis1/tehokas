<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WorkflowAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $payload;
    public string $workflowName;
    public ?string $recipientEmail;

    public function __construct(array|null $payload = [], string $workflowName = 'Automação de Demandas', ?string $recipientEmail = null)
    {
        $this->payload = $payload ?? [];
        $this->workflowName = $workflowName;
        // Se vier informado, usa o e-mail da automação; senão faz fallback pro gestor
        $this->recipientEmail = $recipientEmail ?? ($this->payload['gestor_email'] ?? null);
    }

    public function envelope(): Envelope
    {
        $title = $this->payload['title'] ?? ($this->payload['project_id'] ?? 'Demanda');
        return new Envelope(
            subject: "[Alerta de Automação] Atualização na Demanda: {$title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtmlBody(),
        );
    }

    private function buildHtmlBody(): string
    {
        $title = htmlspecialchars((string) ($this->payload['title'] ?? 'Demanda Atualizada'));
        $userName = htmlspecialchars((string) ($this->payload['usuario_nome'] ?? 'Gestor'));
        $projectId = htmlspecialchars((string) ($this->payload['project_id'] ?? '-'));
        $statusAntigo = htmlspecialchars((string) ($this->payload['status_antigo'] ?? 'Cadastrado'));
        $statusNovo = htmlspecialchars((string) ($this->payload['status_novo'] ?? '-'));
        $email = htmlspecialchars((string) ($this->recipientEmail ?? '-'));

        return <<<HTML
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
                .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
                .header { background-color: #0f172a; padding: 20px; border-bottom: 3px solid #ef4444; }
                .header h1 { color: #ffffff; font-size: 18px; margin: 0; }
                .content { padding: 24px; }
                .badge { display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: bold; border-radius: 9999px; background-color: #eff6ff; color: #2563eb; }
                .info-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                .info-table td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                .info-table td.label { color: #64748b; font-weight: 600; width: 35%; }
                .info-table td.value { color: #0f172a; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h1>Tehokas Workflow Engine</h1>
                </div>
                <div class="content">
                    <span class="badge">{$this->workflowName}</span>
                    <h2 style="font-size: 18px; margin: 15px 0 10px 0;">{$title}</h2>
                    <p style="font-size: 14px; color: #475569;">Olá, <strong>{$userName}</strong>. O status da demanda foi alterado:</p>
                    <table class="info-table">
                        <tr><td class="label">ID da Demanda:</td><td class="value">#{$projectId}</td></tr>
                        <tr><td class="label">Status Anterior:</td><td class="value">{$statusAntigo}</td></tr>
                        <tr><td class="label">Novo Status:</td><td class="value" style="color: #16a34a;">{$statusNovo}</td></tr>
                        <tr><td class="label">Destinatário:</td><td class="value">{$email}</td></tr>
                    </table>
                </div>
            </div>
        </body>
        </html>
        HTML;
    }
}