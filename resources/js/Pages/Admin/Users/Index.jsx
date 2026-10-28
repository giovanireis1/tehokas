import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm } from '@inertiajs/react';

export default function UsersIndex({ users, tenants }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        tenant_id: tenants?.[0]?.id || '',
        role: 'user',
        is_admin: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const userList = users?.data || [];
    const tenantList = tenants || [];

    return (
        <AppLayout header="Gestão de Usuários">
            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Gerencie os usuários e seus respectivos vínculos com empresas clientes.
                </p>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-red-600/20 cursor-pointer"
                >
                    + Novo Usuário
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200/80 dark:border-slate-800/80 uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">E-mail</th>
                            <th className="p-4">Empresa (Tenant)</th>
                            <th className="p-4">Função</th>
                            <th className="p-4">Nível de Acesso</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {userList.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-slate-400">
                                    Nenhum usuário cadastrado.
                                </td>
                            </tr>
                        ) : (
                            userList.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                                    <td className="p-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                                    <td className="p-4 text-slate-500">{u.email}</td>
                                    <td className="p-4">
                                        {u.tenant ? (
                                            <span className="font-medium text-slate-700 dark:text-slate-300">🏢 {u.tenant.name}</span>
                                        ) : (
                                            <span className="text-slate-400 italic">Sem empresa fixa (Global)</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-mono uppercase">{u.role}</td>
                                    <td className="p-4">
                                        {u.is_admin ? (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                Super Admin
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                                Padrão
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Criação */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Cadastrar Novo Usuário</h2>
                        <form onSubmit={submit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Nome Completo</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-red-500"
                                />
                                {errors.name && <p className="text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">E-mail</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-red-500"
                                />
                                {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Senha Provisória</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-red-500"
                                />
                                {errors.password && <p className="text-red-500 mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Vincular a Empresa</label>
                                <select
                                    value={data.tenant_id}
                                    onChange={(e) => setData('tenant_id', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-red-500"
                                >
                                    <option value="">Nenhuma (Super Admin Global)</option>
                                    {tenantList.map((t) => (
                                        <option key={t.id} value={t.id}>🏢 {t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_admin_check"
                                    checked={data.is_admin}
                                    onChange={(e) => setData('is_admin', e.target.checked)}
                                    className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 cursor-pointer"
                                />
                                <label htmlFor="is_admin_check" className="text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                                    Conceder permissões de Super Admin
                                </label>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium cursor-pointer disabled:opacity-50"
                                >
                                    {processing ? 'Salvando...' : 'Cadastrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}