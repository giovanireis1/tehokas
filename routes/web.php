<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\WorkflowController;
use App\Http\Controllers\Admin\TenantManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Redirecionamento da raiz: Dashboard se autenticado, Login se não autenticado
Route::get('/', function () {
    return Auth::check() 
        ? redirect()->route('dashboard') 
        : redirect()->route('login');
});

// Dashboard protegido
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Demandas & Projetos
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::patch('/projects/{project}/status', [ProjectController::class, 'updateStatus'])->name('projects.update-status');

    // Automações & Workflows
    Route::get('/workflows', [WorkflowController::class, 'index'])->name('workflows.index');
    Route::post('/workflows', [WorkflowController::class, 'store'])->name('workflows.store');
    Route::put('/workflows/{workflow}', [WorkflowController::class, 'update'])->name('workflows.update');
    Route::patch('/workflows/{workflow}/toggle', [WorkflowController::class, 'toggleActive'])->name('workflows.toggle');

    Route::post('/admin/switch-tenant', [TenantManagementController::class, 'switchTenant'])
        ->name('admin.switch-tenant');

    // Módulo de Gestão Global (acessível por admin)
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/tenants', [TenantManagementController::class, 'index'])->name('tenants.index');
        Route::post('/tenants', [TenantManagementController::class, 'store'])->name('tenants.store');

        Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
        Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
    });

});

require __DIR__.'/auth.php';