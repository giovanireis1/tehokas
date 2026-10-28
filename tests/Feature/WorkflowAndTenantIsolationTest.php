<?php

namespace Tests\Feature;

use App\Jobs\ExecuteWorkflowJob;
use App\Models\Project;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class WorkflowAndTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenantA;
    protected Tenant $tenantB;
    protected User $userTenantA;
    protected User $userTenantB;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Criação dos Tenants com slug
        $this->tenantA = Tenant::create([
            'name' => 'Tenant Alfa',
            'slug' => 'alfa',
        ]);

        $this->tenantB = Tenant::create([
            'name' => 'Tenant Beta',
            'slug' => 'beta',
        ]);

        // 2. Criação dos Usuários
        $this->userTenantA = User::create([
            'tenant_id' => $this->tenantA->id,
            'name'      => 'Admin Alfa',
            'email'     => 'admin@alfa.com',
            'password'  => Hash::make('password'),
        ]);

        $this->userTenantB = User::create([
            'tenant_id' => $this->tenantB->id,
            'name'      => 'Admin Beta',
            'email'     => 'admin@beta.com',
            'password'  => Hash::make('password'),
        ]);
    }

    /**
     * Valida que o utilizador do Tenant A não consegue ver demandas do Tenant B.
     */
    public function test_tenant_a_cannot_see_projects_from_tenant_b(): void
    {
        Project::create([
            'tenant_id'      => $this->tenantA->id,
            'title'          => 'Demanda Tenant A',
            'status'         => 'Backlog',
            'applicant'      => 'Solicitante Alfa',
            'manager_email'  => 'gestor@alfa.com',
        ]);

        Project::create([
            'tenant_id'      => $this->tenantB->id,
            'title'          => 'Demanda Tenant B',
            'status'         => 'Backlog',
            'applicant'      => 'Solicitante Beta',
            'manager_email'  => 'gestor@beta.com',
        ]);

        $response = $this->actingAs($this->userTenantA)->get('/projects');

        $response->assertStatus(200);
        $response->assertSee('Demanda Tenant A');
        $response->assertDontSee('Demanda Tenant B');
    }

    /**
     * Valida que o utilizador do Tenant A não consegue alterar status de demanda do Tenant B.
     */
    public function test_tenant_a_cannot_update_project_from_tenant_b(): void
    {
        $projectB = Project::create([
            'tenant_id'      => $this->tenantB->id,
            'title'          => 'Demanda Confidencial Beta',
            'status'         => 'Backlog',
            'applicant'      => 'Solicitante Beta',
            'manager_email'  => 'gestor@beta.com',
        ]);

        $response = $this->actingAs($this->userTenantA)
            ->patch("/projects/{$projectB->id}/status", [
                'status' => 'Planejamento',
                'notes'  => 'Tentativa de invasão entre tenants',
            ]);

        $response->assertStatus(404);

        $this->assertDatabaseHas('projects', [
            'id'     => $projectB->id,
            'status' => 'Backlog',
        ]);
    }

    /**
     * Valida a geração do registo de auditoria ao atualizar o status.
     */
    public function test_updating_status_generates_an_audit_log_entry(): void
    {
        $projectA = Project::create([
            'tenant_id'      => $this->tenantA->id,
            'title'          => 'Demanda para Auditoria',
            'status'         => 'Backlog',
            'applicant'      => 'Solicitante Alfa',
            'manager_email'  => 'gestor@alfa.com',
        ]);

        $this->actingAs($this->userTenantA)
            ->patch("/projects/{$projectA->id}/status", [
                'status' => 'Planejamento',
                'notes'  => 'Avanço para fase técnica',
            ]);

        $this->assertDatabaseHas('project_status_logs', [
            'tenant_id'   => $this->tenantA->id,
            'project_id'  => $projectA->id,
            'user_id'     => $this->userTenantA->id,
            'status_from' => 'Backlog',
            'status_to'   => 'Planejamento',
            'notes'       => 'Avanço para fase técnica',
        ]);
    }

    /**
     * Valida o disparo assíncrono do Job de workflow no motor de automação.
     */
   /**
     * Valida o disparo assíncrono do Job de workflow no motor de automação.
     */
    /**
     * Valida o disparo assíncrono do Job de workflow no motor de automação.
     */
    public function test_updating_status_dispatches_workflow_execution_job(): void
    {
        Queue::fake();

        // Cria a regra com o nome de coluna correto: trigger_event
        \App\Models\Workflow::create([
            'tenant_id'     => $this->tenantA->id,
            'name'          => 'Notificar Mudança de Status',
            'trigger_event' => 'status_projeto_alterado',
            'action_type'   => 'send_email',
            'is_active'     => true,
        ]);

        $projectA = Project::create([
            'tenant_id'      => $this->tenantA->id,
            'title'          => 'Demanda Disparo Job',
            'status'         => 'Backlog',
            'applicant'      => 'Solicitante Alfa',
            'manager_email'  => 'gestor@alfa.com',
        ]);

        $this->actingAs($this->userTenantA)
            ->patch("/projects/{$projectA->id}/status", [
                'status' => 'Planejamento',
                'notes'  => 'Disparar automação de fila',
            ]);

        Queue::assertPushed(ExecuteWorkflowJob::class);
    }
}