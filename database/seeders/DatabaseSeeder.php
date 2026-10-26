<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Cria o Tenant
        $tenant = Tenant::create([
            'name' => 'Empresa Demonstração',
            'slug' => 'empresa-demonstracao',
        ]);

        // 2. Cria o Utilizador associado
        $user = User::create([
            'tenant_id' => $tenant->id,
            'name'      => 'Sebastião Giovani dos  Reis',
            'email'     => 'sgiovanireis@gmail.com',
            'password'  => Hash::make('12345678'),
        ]);

        // 3. Cria as Demandas com as colunas corretas (start_date e due_date)
        Project::create([
            'tenant_id'     => $tenant->id,
            'code'          => 'DEM-1001',
            'title'         => 'Integração de Webhook com Gateway de Pagamento',
            'applicant'     => 'Diretoria Financeira',
            'manager_email' => 'financeiro@tehokas.io',
            'priority'      => 'Alta',
            'status'        => 'Aguardando',
            'start_date'    => now()->toDateString(),
            'due_date'      => now()->addDays(7)->toDateString(),
            'git_link'      => 'https://github.com/tehokas/payment-api',
            'description'   => 'Criar escutadores para notificação automática de cobrança.',
        ]);

        Project::create([
            'tenant_id'     => $tenant->id,
            'code'          => 'DEM-1002',
            'title'         => 'Refatoração da Pipeline de Disparo de E-mails',
            'applicant'     => 'Equipe de Infraestrutura',
            'manager_email' => 'tech@tehokas.io',
            'priority'      => 'Crítica',
            'status'        => 'Em Andamento',
            'start_date'    => now()->subDays(2)->toDateString(),
            'due_date'      => now()->addDays(3)->toDateString(),
            'git_link'      => 'https://github.com/tehokas/email-service',
            'description'   => 'Migração do envio síncrono para o Redis Queue.',
        ]);
    }
}