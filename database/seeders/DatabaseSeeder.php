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
        // 1. Cria o Tenant único
        $tenant = Tenant::create([
            'name'      => 'Tehokas IO',
            'slug'      => 'tehokas-io',
            'plan'      => 'Enterprise',
            'is_active' => true,
        ]);

        // 2. Cria o Usuário Super Admin Global (tenant_id null, is_admin true)
        User::create([
            'tenant_id' => null,
            'name'      => 'Sebastião Giovani dos Reis',
            'email'     => 'sgiovanireis@gmail.com',
            'password'  => Hash::make('12345678'),
            'role'      => 'admin',
            'is_admin'  => true,
            'is_active' => true,
        ]);

       
    }
}