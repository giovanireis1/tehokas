<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::with('tenant')->latest()->paginate(10);
        $tenants = Tenant::where('is_active', true)->select('id', 'name')->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'tenants' => $tenants,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'tenant_id' => 'nullable|exists:tenants,id',
            'role' => 'required|string',
            'is_admin' => 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_admin'] = $request->boolean('is_admin');

        User::create($validated);

        return back()->with('success', 'Usuário cadastrado com sucesso!');
    }
}