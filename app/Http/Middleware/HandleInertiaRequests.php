<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $tenantsList = [];
        $activeTenant = null;

        if ($user) {
            $user->loadMissing('tenant');
            $isAdmin = (bool) ($user->is_admin || $user->role === 'admin');

            // Se for admin, carrega a lista para o dropdown
            if ($isAdmin) {
                $tenantsList = Tenant::select('id', 'name', 'slug', 'plan')->orderBy('name')->get();
                $activeTenantId = session('active_tenant_id') ?? $user->tenant_id ?? $tenantsList->first()?->id;

                if ($activeTenantId) {
                    $activeTenant = Tenant::find($activeTenantId);
                }
            } else {
                $activeTenant = $user->tenant;
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_admin' => (bool) ($user->is_admin || $user->role === 'admin'),
                    'tenant' => $activeTenant ? [
                        'id' => $activeTenant->id,
                        'name' => $activeTenant->name,
                        'slug' => $activeTenant->slug,
                        'plan' => $activeTenant->plan,
                        'document_number' => $activeTenant->document_number ?? null,
                    ] : null,
                ] : null,
            ],
            'admin_data' => [
                'tenants' => $tenantsList,
                'active_tenant_id' => session('active_tenant_id') ?? $user?->tenant_id,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}