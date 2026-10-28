import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm, router } from '@inertiajs/react';

export default function TenantsIndex({ tenants }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        plan: 'Enterprise',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.tenants.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    return (
        <AppLayout header="Gestão de Clientes (Tenants)">
            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Gerencie as empresas e instâncias cadastradas na plataforma.
                </p>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-red-600/20"
                >
                    + Novo Cliente
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200/80 dark:border-slate-800/80 uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Empresa</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4">Plano</th>
                            <th className="p-4">Usuários</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {tenants.data.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                                <td className="p-4 font-mono text-slate-400">#{t.id}</td>
                                <td className="p-4 font-bold text-slate-900 dark:text-white">{t.name}</td>
                                <td className="p-4 font-mono text-slate-500">{t.slug}</td>
                                <td className="p-4">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-500/10 text-red-500">
                                        {t.plan}
                                    </span>
                                </td>
                                <td className="p-4">{t.users_count || 0} cadastrados</td>
                                <td className="p-4">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500">
                                        Ativo
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Criação */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Cadastrar Novo Cliente</h2>
                        <form onSubmit={submit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Nome da Empresa</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => {
                                        setData({
                                            ...data,
                                            name: e.target.value,
                                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                                        });
                                    }}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-red-500"
                                />
                                {errors.name && <p className="text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Slug</label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Plano</label>
                                <select
                                    value={data.plan}
                                    onChange={(e) => setData('plan', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-red-500"
                                >
                                    <option value="Starter">Starter</option>
                                    <option value="Business">Business</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium"
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