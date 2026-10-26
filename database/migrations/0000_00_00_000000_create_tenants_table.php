<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            
            // Identificação & Tenant
            $table->string('name');                         // Razão Social / Nome Fantasia
            $table->string('slug')->unique();                // Domínio / Identificador Único (Ex: acme-corp)
            $table->string('document_number')->nullable();   // CNPJ / CPF
            
            // Contato principal
            $table->string('email')->nullable();            // E-mail financeiro/contato
            $table->string('phone')->nullable();            // Telefone corporativo
            
            // Endereço
            $table->string('zip_code')->nullable();
            $table->string('address')->nullable();
            $table->string('number')->nullable();
            $table->string('complement')->nullable();
            $table->string('neighborhood')->nullable();
            $table->string('city')->nullable();
            $table->string('state', 2)->nullable();
            
            // Status & Plano de Uso
            $table->string('plan')->default('free');         // free, pro, enterprise
            $table->boolean('is_active')->default(true);     // Ativo / Inativo
            
            $table->timestamps();
            $table->softDeletes();                          // deleted_at (exclusão lógica)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};