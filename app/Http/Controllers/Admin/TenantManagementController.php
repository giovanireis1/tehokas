<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantManagementController extends Controller
{
    public function index()
    {
        $tenants = Tenant::withCount('users')->latest()->paginate(10);
        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $tenants,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tenants,slug',
            'plan' => 'required|string|max:50',
            'email' => 'nullable|email',
        ]);

        Tenant::create(array_merge($validated, ['is_active' => true]));

        return back()->with('success', 'Cliente cadastrado com sucesso!');
    }

    public function switchTenant(Request $request)
    {
        $request->validate(['tenant_id' => 'required|exists:tenants,id']);
        session(['active_tenant_id' => $request->tenant_id]);
        return back();
    }
}