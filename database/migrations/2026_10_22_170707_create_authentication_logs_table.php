<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('authentication_logs', function (Blueprint $table) {
            $table->id();
            
            // Padrão obrigatório
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            
            // Dados do Acesso
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->index();               // E-mail tentado no login
            $table->string('event');                       // 'login_success', 'login_failed', 'logout'
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamps();
            $table->softDeletes();                         // Padrão deleted_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('authentication_logs');
    }
};