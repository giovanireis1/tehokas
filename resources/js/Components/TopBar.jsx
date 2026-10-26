import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function TopBar({ header, user, darkMode, setDarkMode }) {
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center space-x-3">
                <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">{header || 'Painel de Controle'}</h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">Online</span>
            </div>

            <div className="flex items-center space-x-3">
                {/* Alternador de Tema */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50"
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

                {/* Notificações */}
                <div className="relative">
                    <button
                        onClick={() => setNotifyOpen(!notifyOpen)}
                        className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                    </button>

                    {notifyOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-30">
                            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-xs font-semibold uppercase text-slate-400">Alertas Recentes</span>
                                <button onClick={() => setNotifyOpen(false)} className="text-xs text-red-500 cursor-pointer">Fechar</button>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                <div className="p-3">
                                    <p className="font-medium text-emerald-500">Sistema Iniciado</p>
                                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">Ambiente pronto para disparar regras e fluxos.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Perfil & Tenant Ativo */}
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-red-600/20 shrink-0">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div className="text-left hidden md:block">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block leading-tight">
                                {user?.name || 'Usuário'}
                            </span>
                            <span className="text-[10px] text-red-500 dark:text-red-400 font-medium block leading-tight">
                                {user?.tenant?.name ? `🏢 ${user.tenant.name}` : 'Sem Empresa'}
                            </span>
                        </div>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-30">
                            {/* Card de Dados da Empresa e do Usuário */}
                            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
                                <p className="text-[11px] text-slate-400 truncate mb-2">{user?.email}</p>
                                
                                {user?.tenant && (
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] uppercase font-bold text-slate-400">Organização</span>
                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-500 font-bold uppercase">{user.tenant.plan}</span>
                                        </div>
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
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Sair do Sistema</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}