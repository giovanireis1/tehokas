import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function TopBar({ header, user, darkMode, setDarkMode }) {
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { url, props } = usePage();

    const tenants = props.admin_data?.tenants || [];
    const activeTenantId = props.admin_data?.active_tenant_id || user?.tenant?.id;

    const handleSwitchTenant = (e) => {
        const tenantId = e.target.value;
        router.post(route('admin.switch-tenant'), { tenant_id: tenantId }, {
            preserveState: false,
            preserveScroll: true,
        });
    };

    const getPageTitle = () => {
        if (header) return header;
        const path = url.split('?')[0].toLowerCase();

        if (path.startsWith('/admin/tenants')) return 'Gestão de Clientes';
        if (path.startsWith('/admin/users')) return 'Gestão de Usuários';
        if (path.startsWith('/projects') || path.startsWith('/demands')) return 'Projetos & Demandas';
        if (path.startsWith('/workflows')) return 'Automações';
        if (path.startsWith('/dashboard')) return 'Indicadores';

        return 'Painel de Controle';
    };

    return (
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center space-x-4">
                <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {getPageTitle()}
                </h1>

                {/* Dropdown de chaveamento de Tenant para Administrador */}
                {user?.is_admin && tenants.length > 0 && (
                    <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Visualizando:</span>
                        <select
                            value={activeTenantId || ''}
                            onChange={handleSwitchTenant}
                            className="bg-transparent text-xs font-bold text-red-600 dark:text-red-400 outline-none cursor-pointer border-none p-0 pr-6 focus:ring-0"
                        >
                            {tenants.map((t) => (
                                <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    🏢 {t.name} ({t.plan})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-3">
                {/* Alternador de Tema */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
                    title="Alternar Tema"
                >
                    {darkMode ? (
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* Perfil & Tenant Ativo */}
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-red-600/20 shrink-0">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div className="text-left hidden md:block">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block leading-tight">
                                {user?.name || 'Usuário'}
                            </span>
                            <span className="text-[10px] text-red-500 dark:text-red-400 font-medium block leading-tight">
                                {user?.is_admin ? '👑 Super Admin' : (user?.tenant?.name ? `🏢 ${user.tenant.name}` : 'Sem Empresa')}
                            </span>
                        </div>
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-30">
                            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
                                <p className="text-[11px] text-slate-400 truncate mb-2">{user?.email}</p>
                                {user?.tenant && (
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Ambiente Selecionado</p>
                                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 truncate mt-0.5">{user.tenant.name}</p>
                                    </div>
                                )}
                            </div>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 flex items-center space-x-2 transition cursor-pointer"
                            >
                                <span>Sair do Sistema</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}