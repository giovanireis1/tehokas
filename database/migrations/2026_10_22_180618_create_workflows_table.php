<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('trigger_event'); // Ex: 'status_projeto_alterado'
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Índice otimizado para consultas rápidas do motor de busca
            $table->index(['tenant_id', 'trigger_event', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflows');
    }
};