# Tehokas Workflow Engine — Documentação Técnica & Guia de Implantação

## 1. Visão Geral do Sistema

O **Tehokas Workflow Engine** é uma plataforma SaaS *Multi-Tenant* orientada a eventos e microsserviços internos, desenvolvida para automação assíncrona de fluxos operacionais, transições de status de demandas e governança de dados corporativos.

### Principais Pilares Arquiteturais
* **Multi-Tenancy Estrito:** Isolamento lógico por empresa (`tenant_id`) com aplicação automática de *Global Scopes* via trait `BelongsToTenant`.
* **Processamento Assíncrono Desacoplado:** Eloquent Observers interligados a serviços de domínio que despacham execuções para filas gerenciadas em memória pelo **Redis**.
* **Observabilidade e Compliance:** Rastreabilidade integral de acessos com *Event Listeners* e auditoria HTTP em tempo real via *Custom Middlewares*.
* **Interface Moderna e Reativa:** Frontend SPA desenvolvido em **React 18 + Inertia.js**, alimentado por *Skeleton Loaders* para feedback visual contínuo.
* **API First & Segurança:** Integração externa via Webhooks protegidos por **Laravel Sanctum (Bearer Token)** e documentação interativa gerada dinamicamente via **OpenAPI / Swagger (L5-Swagger)**.

---

## 2. Stack Tecnológica & Dependências

### Backend & Serviços
* **Linguagem / Framework:** PHP 8.2+ / Laravel 10/11
* **Autenticação:** Laravel Sanctum (Tokens de API) + Sessão com proteção CSRF (Painel Web)
* **Filas & Caching:** Redis (`predis` / `phpredis`)
* **Servidor de E-mail de Desenvolvimento:** Mailpit (SMTP na porta `1025`, Web UI na `8025`)
* **SGBD Compatível:** PostgreSQL 15+ (Padrão de Produção) ou MySQL 8.0+ (Ambiente Local)
* **Documentação de API:** `darkaonline/l5-swagger` (OpenAPI 3.0 / Swagger UI)

### Frontend
* **Core:** React 18 / Inertia.js
* **Estilização:** Tailwind CSS (com Vite Plugin)
* **Build Tool:** Vite 7+

---

## 3. Mapeamento Arquitetural (Árvore de Dependências PHP)

```text
app/
├── Http/
│   ├── Controllers/
│   │   ├── Controller.php                     # Definição base e esquemas de segurança OpenAPI/Swagger
│   │   ├── DashboardController.php            # Agregação de métricas, cache Redis (remember) e gráficos
│   │   ├── ProjectController.php              # Gestão de demandas com escopo isolado de tenant
│   │   ├── WorkflowController.php             # Construtor reativo de regras dinâmicas N:N (Gatilhos/Ações)
│   │   └── Api/
│   │       ├── AuthController.php             # Emissão de Bearer Token via Sanctum (/api/auth/token)
│   │       └── WebhookController.php          # Recepção de transições externas com blindagem multi-tenant
│   │
│   └── Middleware/
│       ├── AuditLogMiddleware.php             # Interceptador global de auditoria de rotas (audit_logs)
│       └── HandleInertiaRequests.php          # Hidratação do estado de sessão compartilhada para React
│
├── Models/
│   ├── Tenant.php                             # Entidade raiz do particionamento multi-tenant
│   ├── User.php                               # HasApiTokens, traits de escopo e resolução de tenant ativo
│   ├── Project.php                            # Demanda monitorada pelo ciclo de transição de status
│   ├── ProjectStatusLog.php                   # Histórico imutável de transições de status
│   ├── Workflow.php                           # Configuração mestre de automações
│   ├── WorkflowTrigger.php                    # Condições de disparo (ex: status_from -> status_to)
│   ├── WorkflowAction.php                     # Ações a serem executadas (ex: e-mail, webhook secundário)
│   └── WorkflowExecutionLog.php               # Rastreabilidade de execuções de jobs (sucesso/falha/skipped)
│
├── Observers/
│   └── ProjectObserver.php                    # Escuta updated() de Project, gera logs e aciona a engine
│
├── Services/
│   └── WorkflowEngineService.php              # Avaliação de regras N:N e despacho para a fila assíncrona
│
├── Jobs/
│   └── ExecuteWorkflowJob.php                 # Worker Redis para processamento de envio de e-mails/ações
│
├── Listeners/
│   └── LogAuthenticationActivity.php          # Monitora Login/Logout e persiste em authentication_logs
│
└── Providers/
    ├── AppServiceProvider.php                 # Registro de Observers (ProjectObserver)
    └── EventServiceProvider.php               # Mapeamento de eventos de autenticação
```

---

## 4. Fluxo de Execução em Tempo Real

```text
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│ Requisição Web  │  ──>  │ ProjectController│  ──>  │                 │
│ ou Webhook API  │       └──────────────────┘       │  Project::save  │
└─────────────────┘       ┌──────────────────┐       │                 │
                          │WebhookController │  ──>  └────────┬────────┘
                          └──────────────────┘                │
                                                              ▼
                                                   ┌─────────────────────┐
                                                   │   ProjectObserver   │
                                                   └──────────┬──────────┘
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     ▼                                                                                 ▼
        ┌─────────────────────────┐                                                       ┌─────────────────────────┐
        │ Criação de Histórico:   │                                                       │  WorkflowEngineService  │
        │   ProjectStatusLog      │                                                       └────────────┬────────────┘
        └─────────────────────────┘                                                                    │
                                                                                                       ▼
                                                                                          ┌─────────────────────────┐
                                                                                          │ Enfileira Job no Redis: │
                                                                                          │   ExecuteWorkflowJob    │
                                                                                          └────────────┬────────────┘
                                                                                                       │
                                                                                                       ▼
                                                                                          ┌─────────────────────────┐
                                                                                          │ Worker Processa e Envia │
                                                                                          │     E-mail (Mailpit)    │
                                                                                          └────────────┬────────────┘
                                                                                                       │
                                                                                                       ▼
                                                                                          ┌─────────────────────────┐
                                                                                          │ Grava Log de Auditoria: │
                                                                                          │  WorkflowExecutionLog   │
                                                                                          └─────────────────────────┘
```

---

## 5. Pré-requisitos & Serviços de Infraestrutura

### 5.1. Instalação e Execução do Redis (Filas e Cache)
1. Baixe o pacote oficial portado para Windows:
   * **URL:** [https://github.com/tporadowski/redis/releases](https://github.com/tporadowski/redis/releases)
   * **Arquivo:** `Redis-x64-5.0.14.1.zip`
2. Extraia o conteúdo em `C:\redis`.
3. Inicie o servidor via terminal:
   ```powershell
   cd C:\redis
   .\redis-server.exe
   ```
4. *(Opcional)* Para instalar como serviço do Windows (início automático):
   ```powershell
   cd C:\redis
   .\redis-server.exe --service-install
   .\redis-server.exe --service-start
   ```
5. **Verificação de conectividade:**
   ```powershell
   C:\redis\redis-cli.exe ping
   # Retorno esperado: PONG
   ```

### 5.2. Instalação e Execução do Mailpit (SMTP Local)
1. Baixe o executável para Windows:
   * **URL:** [https://github.com/axllent/mailpit/releases](https://github.com/axllent/mailpit/releases)
   * **Arquivo:** `mailpit-windows-amd64.zip`
2. Extraia o executável `mailpit.exe` em `C:\mailpit` ou na raiz do projeto.
3. Inicie o serviço:
   ```powershell
   cd C:\mailpit
   .\mailpit.exe
   ```
4. **Interfaces ativas:**
   * **Servidor SMTP:** `127.0.0.1:1025`
   * **Interface Web de Captura:** `http://localhost:8025`

---

## 6. Procedimento de Instalação e Configuração

### 6.1. Clonagem e Dependências
Na raiz do projeto (`C:\laragon\www\tehokas-workflow`):

```powershell
# 1. Instalação de dependências PHP
composer install

# 2. Instalação de pacotes Node com compatibilidade de dependências pares
npm install --legacy-peer-deps
```

### 6.2. Configuração do Arquivo `.env`
Copie o template de ambiente e gere a chave criptográfica:

```powershell
cp .env.example .env
php artisan key:generate
```

Configure os blocos essenciais no seu `.env`:

```env
APP_NAME="Tehokas Workflow Engine"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Conexão de Banco de Dados (Exemplo MySQL)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tehokas_workflow
DB_USERNAME=root
DB_PASSWORD=

# Caso utilize PostgreSQL:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=tehokas_workflow
# DB_USERNAME=postgres
# DB_PASSWORD=sua_senha

# Filas e Cache Estratégico (Redis)
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Interceptação de E-mails (Mailpit)
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="notificacoes@tehokas.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 6.3. Banco de Dados e Documentação
```powershell
# Criação de tabelas e carga inicial de dados
php artisan migrate --seed

# Compilação das anotações OpenAPI/Swagger
php artisan l5-swagger:generate

# Compilação dos assets React/Inertia
npm run build
```

---

## 7. Execução dos Processos da Aplicação

Para o funcionamento completo das automações, mantenha os seguintes processos em execução em janelas distintas do terminal:

| Processo | Comando de Execução | Descrição |
| :--- | :--- | :--- |
| **Fila Assíncrona** | `php artisan queue:work --tries=3` | Consome os jobs despachados no Redis |
| **Servidor Web** | `php artisan serve` | Inicializa a aplicação em `http://localhost:8000` |
| **Redis Server** | `C:\redis\redis-server.exe` | Gerencia chaves de cache e filas em memória |
| **Mailpit Server** | `.\mailpit.exe` | Captura os e-mails disparados pelo worker |

---

## 8. Segurança da API e Regras de Multi-Tenancy

O endpoint de webhook em `/api/webhooks/projects/status` implementa validação estrita de fronteiras de isolamento:

1. **Autenticação Mandatória:** Requer cabeçalho `Authorization: Bearer {token}` gerado pelo endpoint `/api/auth/token`.
2. **Resolução Soberana de Tenant:** O `tenant_id` é extraído do usuário atrelado ao token (`$request->user()->tenant_id`).
3. **Bloqueio de Requisição Cruzada (Anti-Tampering):** Se um usuário do Tenant 1 submeter um payload com `"tenant_id": 2`, a API rejeita a operação com status HTTP **`403 Forbidden`**:
   ```json
   {
     "success": false,
     "error": "Forbidden",
     "message": "Acesso negado: Seu token pertence ao Tenant 1 e não possui permissão para alterar dados do Tenant 2."
   }
   ```
4. **Log de Auditoria Automático:** Toda alteração via webhook é registrada na tabela `audit_logs` contendo o payload original, rota, IP de origem e identificação do usuário autenticado.

---

## 9. Links de Referência Local

* **Aplicação Web:** [http://localhost:8000](http://localhost:8000)
* **Documentação Swagger UI:** [http://localhost:8000/api/documentation](http://localhost:8000/api/documentation)
* **Painel de E-mails (Mailpit):** [http://localhost:8025](http://localhost:8025)