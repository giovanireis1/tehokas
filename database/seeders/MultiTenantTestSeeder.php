<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Workflow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MultiTenantTestSeeder extends Seeder
{
    /**
     * Semeia uma nova organização (Tenant B) com usuário e dados isolados.
     */
    public function run(): void
    {
        // 1. Cria ou recupera a Empresa B
        $tenantB = Tenant::firstOrCreate(
            ['slug' => 'acme-corp'],
            [
                'name' => 'Acme Corporation',
                'plan' => 'Enterprise',
            ]
        );

        // 2. Cria o Usuário gestor da Empresa B
        $userB = User::firstOrCreate(
            ['email' => 'gestor@acmecorp.com'],
            [
                'name'              => 'Gestor Acme',
                'password'          => Hash::make('password123'),
                'tenant_id'         => $tenantB->id,
                'email_verified_at' => now(),
            ]
        );

        // 3. Cria uma demanda exclusiva do Tenant B
        Project::withoutGlobalScopes()->firstOrCreate(
            [
                'tenant_id' => $tenantB->id,
                'title'     => 'Migração de Servidores Legados (Acme)',
            ],
            [
                'code'           => 'DEM-ACM01',
                'applicant'      => 'Diretoria de TI Acme',
                'manager_email'  => 'gestor@acmecorp.com',
                'developer_name' => 'Engenheiro Acme',
                'priority'       => 'Alta',
                'status'         => 'Em Andamento',
                'start_date'     => now()->toDateString(),
                'due_date'       => now()->addDays(15)->toDateString(),
                'description'    => 'Demanda confidencial interna da Acme Corporation.',
            ]
        );

        // 4. Cria uma regra de workflow exclusiva do Tenant B
        $workflowB = Workflow::withoutGlobalScopes()->firstOrCreate(
            [
                'tenant_id' => $tenantB->id,
                'name'      => 'Alerta de Status Concluído - Acme',
            ],
            [
                'trigger_event' => 'status_projeto_alterado',
                'is_active'     => true,
            ]
        );

        // Condição e Ação do Workflow B
        if ($workflowB->wasRecentlyCreated) {
            $workflowB->conditions()->create([
                'field'    => 'status',
                'operator' => 'in',
                'value'    => json_encode(['Concluído']),
            ]);

            $workflowB->actions()->create([
                'action_type' => 'send_email',
                'payload'     => json_encode(['emails' => ['diretoria@acmecorp.com']]),
            ]);
        }

        $this->command->info(" Tenant B configurado com sucesso!");
        $this->command->info("👤 E-mail: gestor@acmecorp.com");
        $this->command->info("🔑 Senha: password123");
    }
}