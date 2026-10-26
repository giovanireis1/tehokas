<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditLogMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Registra logs apenas para ações de escrita/alteração
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $user = Auth::user();
            
            // Remove campos sensíveis da auditoria
            $sanitizedPayload = $request->except(['password', 'password_confirmation', '_token']);

            AuditLog::create([
                'tenant_id'  => $user->tenant_id ?? 1,
                'user_id'    => $user->id ?? null,
                'user_name'  => $user->name ?? 'Sistema/Convidado',
                'route_name' => $request->route() ? $request->route()->getName() : null,
                'url'        => $request->fullUrl(),
                'method'     => $request->method(),
                'action'     => $request->route() ? $request->route()->getActionName() : 'N/A',
                'payload'    => $sanitizedPayload,
                'ip_address' => $request->ip(),
            ]);
        }

        return $response;
    }
}