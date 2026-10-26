import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { url } = usePage();

    return (
        <aside
            className={`${
                sidebarOpen ? 'w-64' : 'w-20'
            } bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 flex flex-col z-20 shadow-xl shrink-0`}
        >
            {/* Header do Logo & Botão para Recolher/Expandir */}
            <div
                className={`h-16 px-3 flex items-center border-b border-slate-200/80 dark:border-slate-800/80 ${
                    sidebarOpen ? 'justify-between' : 'justify-center'
                }`}
            >
                {sidebarOpen && (
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0 text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
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
                    title={sidebarOpen ? 'Recolher Menu' : 'Expandir Menu'}
                >
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${
                            !sidebarOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                        />
                    </svg>
                </button>
            </div>

            {/* Navegação Principal */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
                <div>
                    {sidebarOpen && (
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                            Geral
                        </p>
                    )}
                    <div className="space-y-1">
                        {/* 1. Dashboard / Central de Automações */}
                        <Link
                            href="/dashboard"
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs ${
                                url.startsWith('/dashboard')
                                    ? 'bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <svg
                                className="w-5 h-5 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            {sidebarOpen && <span className="whitespace-nowrap">Central de Automações</span>}
                        </Link>

                        {/* 2. Projetos & Demandas (Novo) */}
                        <Link
                            href="/projects"
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs ${
                                url.startsWith('/projects')
                                    ? 'bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <svg
                                className="w-5 h-5 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                            </svg>
                            {sidebarOpen && <span className="whitespace-nowrap">Projetos & Demandas</span>}
                        </Link>

                        {/* 3. Automações & Workflows */}
                        <Link
                            href="/workflows"
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs ${
                                url.startsWith('/workflows')
                                    ? 'bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <svg
                                className="w-5 h-5 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            {sidebarOpen && <span className="whitespace-nowrap">Automações</span>}
                        </Link>


                    </div>
                </div>
            </nav>

            {/* Status do Motor no Rodapé da Sidebar */}
            {sidebarOpen && (
                <div className="p-3 m-3 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            Motor de Workflows
                        </span>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1.5">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">100% dos serviços online</p>
                </div>
            )}
        </aside>
    );
}