import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ 
    auth, 
    stats, 
    chartData = [], 
    actionDistribution = [], 
    recentLogs = [], 
    recentAuditLogs = [],
    recentStatusTransitions = []
}) {
    const [activeTab, setActiveTab] = useState('workflows');

    const maxChartValue = Math.max(
        ...chartData.map(d => (d.sucesso || 0) + (d.skipped || 0) + (d.falha || 0)),
        1
    );

    return (
        <AppLayout user={auth?.user} title="Painel de Controle">
            <Head title="Painel de Controle" />

            <div className="space-y-6 w-full pb-10">

                {/* 1. CARDS DE MÉTRICAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                    
                    {/* Workflows */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Workflows</div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.total_workflows || 0}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {stats?.active_workflows || 0} Ativos
                            </span>
                        </div>
                    </div>

                    {/* Projetos / Demandas */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Demandas</div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.total_projects || 0}</span>
                            <span className="text-[10px] font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                Cadastradas
                            </span>
                        </div>
                    </div>

                    {/* Gatilhos Avaliados */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gatilhos / Eventos</div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.total_triggers || 0}</span>
                            <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                {stats?.total_alerts_sent || 0} Disparados
                            </span>
                        </div>
                    </div>

                    {/* Transições Ignoradas / Regra Não Atendida */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Condições Descartadas</div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-black text-amber-500">{stats?.total_skipped || 0}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Skipped
                            </span>
                        </div>
                    </div>

                    {/* Auditoria / Logins */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Acessos & Auditoria</div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats?.total_audit || 0}</span>
                            <span className="text-[10px] font-semibold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
                                {stats?.total_logins || 0} Logins
                            </span>
                        </div>
                    </div>

                </div>

                {/* 2. GRÁFICO E DISTRIBUIÇÃO */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">

                    {/* Gráfico de Barras com dados reais */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Volume de Eventos (Últimos 7 dias)</h3>
                                <p className="text-[11px] text-slate-400">Total de transições e avaliações de workflows processadas</p>
                            </div>
                            <div className="flex items-center space-x-3 text-xs font-medium">
                                <span className="flex items-center text-slate-600 dark:text-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span> Sucessos
                                </span>
                                <span className="flex items-center text-slate-600 dark:text-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1.5"></span> Skipped
                                </span>
                                <span className="flex items-center text-slate-600 dark:text-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></span> Falhas
                                </span>
                            </div>
                        </div>

                        <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-slate-100 dark:border-slate-800 pb-2 w-full">
                            {chartData.map((item, idx) => {
                                const total = (item.sucesso || 0) + (item.skipped || 0) + (item.falha || 0);
                                const heightPercent = total > 0 ? Math.round((total / maxChartValue) * 100) : 4;

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-lg border border-slate-700">
                                            {item.sucesso} disparos | {item.skipped} ignorados | {item.falha} falhas
                                        </div>

                                        <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800/50 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                                            <div 
                                                style={{ height: `${heightPercent}%` }} 
                                                className="w-full flex flex-col justify-end transition-all rounded-t-sm overflow-hidden"
                                            >
                                                {item.falha > 0 && (
                                                    <div style={{ height: `${(item.falha / total) * 100}%` }} className="bg-red-500 w-full"></div>
                                                )}
                                                {item.skipped > 0 && (
                                                    <div style={{ height: `${(item.skipped / total) * 100}%` }} className="bg-amber-400 w-full"></div>
                                                )}
                                                {item.sucesso > 0 && (
                                                    <div style={{ height: `${(item.sucesso / total) * 100}%` }} className="bg-emerald-500 w-full"></div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-400">{item.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Proporção de Ações & Estado da Fila */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Resumo de Processamento</h3>
                            <p className="text-[11px] text-slate-400 mb-5">Proporção das avaliações do motor</p>

                            <div className="space-y-4">
                                {actionDistribution.map((action, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                                            <span>{action.type}</span>
                                            <span className="font-bold">{action.count} ({action.percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${action.color}`} 
                                                style={{ width: `${action.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Worker Redis</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-full">Ativo & Operacional</span>
                        </div>
                    </div>

                </div>

                {/* 3. MULTI-TABELA: LOGS DE WORKFLOW / AUDITORIA / TRANSIÇÕES */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden w-full">
                    
                    {/* Cabeçalho com Abas */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Registros & Rastreabilidade</h3>
                            <p className="text-[11px] text-slate-400">Dados reais gravados no banco de dados</p>
                        </div>

                        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('workflows')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                    activeTab === 'workflows' 
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                Execuções do Worker
                            </button>
                            <button
                                onClick={() => setActiveTab('status')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                    activeTab === 'status' 
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                Transições de Demanda
                            </button>
                            <button
                                onClick={() => setActiveTab('audit')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                    activeTab === 'audit' 
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                Acessos e Rotas
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo Aba 1: Execuções do Worker */}
                    {activeTab === 'workflows' && (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-800/40 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Workflow</th>
                                        <th className="px-5 py-3">Gatilho</th>
                                        <th className="px-5 py-3">Mensagem do Motor</th>
                                        <th className="px-5 py-3 text-right">Data/Hora</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {recentLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {log.status === 'success' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        ✓ Sucesso
                                                    </span>
                                                )}
                                                {log.status === 'skipped' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        ⊘ Ignorado
                                                    </span>
                                                )}
                                                {log.status === 'failed' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                                        ✕ Falha
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                {log.workflow}
                                            </td>
                                            <td className="px-5 py-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                {log.event}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600 dark:text-slate-300 max-w-md truncate">
                                                {log.message}
                                            </td>
                                            <td className="px-5 py-3 text-right whitespace-nowrap text-slate-400 font-medium">
                                                {log.created_at}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-6 text-slate-400">Nenhum log de execução registrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Conteúdo Aba 2: Transições de Status */}
                    {activeTab === 'status' && (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-800/40 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-5 py-3">Demanda</th>
                                        <th className="px-5 py-3">Origem</th>
                                        <th className="px-5 py-3">Destino</th>
                                        <th className="px-5 py-3">Notas</th>
                                        <th className="px-5 py-3 text-right">Horário</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {recentStatusTransitions.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                                            <td className="px-5 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                {item.project_title}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                                                    {item.from}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span className="text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded text-[11px] font-bold">
                                                    {item.to}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                                                {item.notes || '-'}
                                            </td>
                                            <td className="px-5 py-3 text-right whitespace-nowrap text-slate-400 font-medium">
                                                {item.created_at}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Conteúdo Aba 3: Auditoria & Acesso */}
                    {activeTab === 'audit' && (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-800/40 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-5 py-3">Usuário</th>
                                        <th className="px-5 py-3">Método</th>
                                        <th className="px-5 py-3">Rota Acessada</th>
                                        <th className="px-5 py-3 text-right">Horário</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {recentAuditLogs.map((audit) => (
                                        <tr key={audit.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                                            <td className="px-5 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                {audit.user}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-300">
                                                    {audit.method}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                                {audit.route}
                                            </td>
                                            <td className="px-5 py-3 text-right whitespace-nowrap text-slate-400 font-medium">
                                                {audit.created_at}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>

            </div>
        </AppLayout>
    );
}