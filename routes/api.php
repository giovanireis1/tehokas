<?php
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/projects/status', [WebhookController::class, 'updateProjectStatus'])
    ->name('api.webhooks.project.status');