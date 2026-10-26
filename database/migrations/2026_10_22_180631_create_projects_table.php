<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('title');
            $table->string('applicant');
            $table->string('manager_email');
            $table->string('developer_name')->nullable(); // Developer Responsável
            $table->string('priority')->default('Média');
            $table->string('status')->default('Aguardando');
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->string('git_link')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};