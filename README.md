# Tehokas Workflow Engine - Multi-Tenant

Motor de automação de workflows e gestão de demandas multi-tenant desenvolvido em **Laravel**, focado em isolamento rigoroso de dados (*Single-Database Multi-Tenancy*), trilha de auditoria completa e execução assíncrona orientada a eventos.

---

## 🏛 Arquitetura e Decisões Técnicas

* **Estratégia Multi-Tenant:** Single-Database com chave estrangeira `tenant_id`. O isolamento é aplicado em nível de banco através de um *Global Scope* no Eloquent (`TenantScope`), garantindo que consultas, atualizações e exclusões fiquem estritamente contidas no escopo do tenant autenticado.
* **Auditoria de Conformidade:** Cada transição de estado da demanda (`Project`) gera um registro imutável em `project_status_logs`, armazenando o status anterior, o status atual, anotações de progresso e o usuário responsável.
* **Processamento Assíncrono:** As automações de workflow disparam eventos consumidos de forma não bloqueante via filas no **Redis**, com despacho do `ExecuteWorkflowJob`.
* **Notificações em Desenvolvimento:** Captura local de e-mails via **Mailpit** (SMTP na porta `1025` e visualizador web na porta `8025`).

---

## 🚀 Opção 1: Execução via Docker (Recomendado para Avaliação)

A aplicação possui orquestração completa via **Docker Compose** integrando PHP 8.3 CLI, PostgreSQL 16, Redis, Mailpit e um Worker dedicado para filas.

### 1. Clonar o repositório e preparar o ambiente
```bash
git clone [https://github.com/SEU-USUARIO/tehokas-workflow.git](https://github.com/SEU-USUARIO/tehokas-workflow.git)
cd tehokas-workflow
cp .env.docker.example .env