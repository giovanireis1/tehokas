import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { url, props } = usePage();
    const isAdmin = props.auth?.user?.is_admin;

    return (
        <aside
            className={`${
                sidebarOpen ? 'w-64' : 'w-20'
            } bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 flex flex-col z-20 shadow-xl shrink-0`}
        >
            {/* Header */}
            <div
                className={`h-16 px-3 flex items-center border-b border-slate-200/80 dark:border-slate-800/80 ${
                    sidebarOpen ? 'justify-between' : 'justify-center'
                }`}
            >
                {sidebarOpen && (
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0 text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                            TEHOKAS<span className="text-red-600 dark:text-red-500">.IO</span>
                        </span>
                    </div>
                )}

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition cursor-pointer shrink-0"
                >
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Navegação */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
                <div>
                    {sidebarOpen && (
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                            Geral
                        </p>
                    )}
                    <div className="space-y-1">
                        <Link
                            href={route('dashboard')}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs ${
                                url.startsWith('/dashboard')
                                    ? 'bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {sidebarOpen && <span className="whitespace-nowrap">Indicadores</span>}
                        </Link>

                        <Link
                            href={route('projects.index')}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs ${
                                url.startsWith('/projects')
                                    ? 'bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            {sidebarOpen && <span className="whitespace-nowrap">Projetos & Demandas</span>}
                        </Link>

                        <Link
                            href={route('workflows.index')}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs ${
                                url.startsWith('/workflows')
                                    ? 'bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {sidebarOpen && <span className="whitespace-nowrap">Automações</span>}
                        </Link>
                    </div>
                </div>

                {/* Bloco de Gestão Exclusivo para Super Admin */}
                {isAdmin && (
                    <div>
                        {sidebarOpen && (
                            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">
                                Gestão Global
                            </p>
                        )}
                        <div className="space-y-1">
                            <Link
                                href={route('admin.tenants.index')}
                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs ${
                                    url.startsWith('/admin/tenants')
                                        ? 'bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {sidebarOpen && <span className="whitespace-nowrap">Clientes (Tenants)</span>}
                            </Link>

                            <Link
                                href={route('admin.users.index')}
                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs ${
                                    url.startsWith('/admin/users')
                                        ? 'bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                {sidebarOpen && <span className="whitespace-nowrap">Usuários</span>}
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </aside>
    );
}