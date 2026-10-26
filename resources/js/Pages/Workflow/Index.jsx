import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';

const ALL_STATUSES = [
    'Aguardando',
    'Planejamento',
    'Em Andamento',
    'Bloqueado',
    'Em Testes',
    'Concluído',
    'Cancelado'
];

export default function Index({ auth, workflows = [], triggers = [] }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [selectedLogs, setSelectedLogs] = useState(null);

    const { 
        data: createData, 
        setData: setCreateData, 
        reset: resetCreate 
    } = useForm({
        name: '',
        trigger_event: triggers[0]?.id || 'status_projeto_alterado',
        is_active: true,
        selected_statuses: ['Aguardando'],
        emails_text: auth?.user?.email || '',
    });

    const { 
        data: editData, 
        setData: setEditData 
    } = useForm({
        name: '',
        trigger_event: 'status_projeto_alterado',
        is_active: true,
        selected_statuses: [],
        emails_text: '',
    });

    const toggleCreateStatus = (st) => {
        if (createData.selected_statuses.includes(st)) {
            setCreateData('selected_statuses', createData.selected_statuses.filter(s => s !== st));
        } else {
            setCreateData('selected_statuses', [...createData.selected_statuses, st]);
        }
    };

    const toggleEditStatus = (st) => {
        if (editData.selected_statuses.includes(st)) {
            setEditData('selected_statuses', editData.selected_statuses.filter(s => s !== st));
        } else {
            setEditData('selected_statuses', [...editData.selected_statuses, st]);
        }
    };

    // Função de Ativar / Desativar rápido
    const handleToggleActive = (workflowId) => {
        router.patch(route('workflows.toggle', workflowId));
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();

        const emailList = createData.emails_text
            .split(',')
            .map(e => e.trim())
            .filter(e => e.length > 0);

        const payload = {
            name: createData.name,
            trigger_event: createData.trigger_event,
            is_active: createData.is_active,
            conditions: [
                { field: 'status', operator: 'in', value: createData.selected_statuses }
            ],
            actions: [
                { action_type: 'send_email', payload: { emails: emailList } }
            ]
        };

        router.post(route('workflows.store'), payload, {
            onSuccess: () => {
                resetCreate();
                setIsCreateModalOpen(false);
            },
        });
    };

    const handleOpenEditModal = (workflow) => {
        setSelectedWorkflow(workflow);
        const condition = workflow.conditions?.[0];
        const action = workflow.actions?.[0];

        let rawStatus = condition?.value || [];
        if (typeof rawStatus === 'string') {
            try { rawStatus = JSON.parse(rawStatus); } catch { rawStatus = [rawStatus]; }
        }

        let rawPayload = action?.payload || {};
        if (typeof rawPayload === 'string') {
            try { rawPayload = JSON.parse(rawPayload); } catch { rawPayload = {}; }
        }
        const emailsArray = rawPayload.emails || (rawPayload.to_email ? [rawPayload.to_email] : []);

        setEditData({
            name: workflow.name,
            trigger_event: workflow.trigger_event,
            is_active: Boolean(workflow.is_active),
            selected_statuses: Array.isArray(rawStatus) ? rawStatus : [rawStatus],
            emails_text: emailsArray.join(', '),
        });
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();

        const emailList = editData.emails_text
            .split(',')
            .map(e => e.trim())
            .filter(e => e.length > 0);

        const payload = {
            name: editData.name,
            trigger_event: editData.trigger_event,
            is_active: editData.is_active,
            conditions: [
                { field: 'status', operator: 'in', value: editData.selected_statuses }
            ],
            actions: [
                { action_type: 'send_email', payload: { emails: emailList } }
            ]
        };

        router.put(route('workflows.update', selectedWorkflow.id), payload, {
            onSuccess: () => {
                setSelectedWorkflow(null);
            },
        });
    };

    return (
        <AppLayout user={auth?.user} title="Gestão de Workflows">
            <Head title="Automações & Workflows" />

            <div className="space-y-6 w-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Central de Automações & Workflows</h2>
                        <p className="text-xs text-slate-400">Configure alertas automáticos para múltiplos status e destinatários.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-500/20 transition cursor-pointer"
                    >
                        + Nova Automação
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800/40 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-3.5">Nome da Automação</th>
                                    <th className="px-5 py-3.5">Gatilho (Evento)</th>
                                    <th className="px-5 py-3.5">Status Monitorados</th>
                                    <th className="px-5 py-3.5">Destinatários</th>
                                    <th className="px-5 py-3.5">Status (Clique p/ alterar)</th>
                                    <th className="px-5 py-3.5 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {workflows && workflows.length > 0 ? (
                                    workflows.map((wf) => {
                                        const triggerObj = triggers.find(t => t.id === wf.trigger_event);
                                        const condition = wf.conditions?.[0];
                                        const action = wf.actions?.[0];

                                        let statuses = condition?.value || [];
                                        if (typeof statuses === 'string') {
                                            try { statuses = JSON.parse(statuses); } catch { statuses = [statuses]; }
                                        }

                                        let actPayload = action?.payload || {};
                                        if (typeof actPayload === 'string') {
                                            try { actPayload = JSON.parse(actPayload); } catch { actPayload = {}; }
                                        }
                                        const emails = actPayload.emails || (actPayload.to_email ? [actPayload.to_email] : []);

                                        // Mapeia tanto camelCase quanto snake_case para os logs
                                        const logs = wf.execution_logs || wf.executionLogs || [];

                                        return (
                                            <tr key={wf.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-slate-900 dark:text-white text-xs">{wf.name}</div>
                                                    <div className="text-[10px] text-slate-400">ID: #{wf.id}</div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="text-slate-800 dark:text-slate-200 font-medium">
                                                        {triggerObj?.label || wf.trigger_event}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.isArray(statuses) && statuses.length > 0 ? (
                                                            statuses.map((st) => (
                                                                <span key={st} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                                                                    {st}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-slate-400">Todos</span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="text-slate-800 dark:text-slate-200 font-medium max-w-xs truncate" title={emails.join(', ')}>
                                                        {emails.length > 0 ? emails.join(', ') : '-'}
                                                    </div>
                                                </td>

                                                {/* Toggle Ativo / Inativo */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggleActive(wf.id)}
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                                            wf.is_active
                                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                                                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20'
                                                        }`}
                                                        title="Clique para ativar/desativar"
                                                    >
                                                        {wf.is_active ? '● Ativo' : '○ Inativo'}
                                                    </button>
                                                </td>

                                                <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                                                    <button
                                                        onClick={() => setSelectedLogs(logs)}
                                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-700"
                                                    >
                                                        📋 Logs ({logs.length})
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEditModal(wf)}
                                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-700"
                                                    >
                                                        ⚙ Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-slate-400">
                                            Nenhuma automação cadastrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL DE CRIAÇÃO */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg shadow-2xl space-y-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Nova Automação</h3>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-500 mb-1">Nome da Automação</label>
                                <input
                                    type="text"
                                    value={createData.name}
                                    onChange={(e) => setCreateData('name', e.target.value)}
                                    placeholder="Ex: Alerta de Projetos Bloqueados ou Atrasados"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-500 mb-1">Gatilho (Evento)</label>
                                <select
                                    value={createData.trigger_event}
                                    onChange={(e) => setCreateData('trigger_event', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                >
                                    {triggers.map((t) => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-500 mb-2">SE o Status for um dos seguintes:</label>
                                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    {ALL_STATUSES.map((st) => {
                                        const isSelected = createData.selected_statuses.includes(st);
                                        return (
                                            <button
                                                key={st}
                                                type="button"
                                                onClick={() => toggleCreateStatus(st)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                                    isSelected
                                                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                {isSelected ? '✓ ' : '+ '} {st}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-500 mb-1">ENTÃO Enviar E-mail para (separados por vírgula):</label>
                                <input
                                    type="text"
                                    value={createData.emails_text}
                                    onChange={(e) => setCreateData('emails_text', e.target.value)}
                                    placeholder="gestor@empresa.com, dev@empresa.com"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold">Criar Automação</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE EDIÇÃO */}
            {selectedWorkflow && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Editar Automação #{selectedWorkflow.id}</h3>
                            <button onClick={() => setSelectedWorkflow(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕ Fechar</button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-500 mb-1">Nome da Automação</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-500 mb-1">Gatilho (Evento)</label>
                                <select
                                    value={editData.trigger_event}
                                    onChange={(e) => setEditData('trigger_event', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                >
                                    {triggers.map((t) => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-500 mb-2">SE o Status for um dos seguintes:</label>
                                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    {ALL_STATUSES.map((st) => {
                                        const isSelected = editData.selected_statuses.includes(st);
                                        return (
                                            <button
                                                key={st}
                                                type="button"
                                                onClick={() => toggleEditStatus(st)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                                    isSelected
                                                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                {isSelected ? '✓ ' : '+ '} {st}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-500 mb-1">ENTÃO Enviar E-mail para (separados por vírgula):</label>
                                <input
                                    type="text"
                                    value={editData.emails_text}
                                    onChange={(e) => setEditData('emails_text', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setSelectedWorkflow(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold shadow-md">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE HISTÓRICO DE LOGS DE EXECUÇÃO */}
            {selectedLogs !== null && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-xl shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Histórico de Execuções</h3>
                            <button onClick={() => setSelectedLogs(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕ Fechar</button>
                        </div>

                        <div className="space-y-2 max-h-72 overflow-y-auto text-xs pr-1">
                            {selectedLogs && selectedLogs.length > 0 ? (
                                selectedLogs.map((log) => (
                                    <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                                        <div className="flex justify-between items-center font-bold">
                                            <span className={log.status === 'success' ? 'text-emerald-500' : 'text-amber-500'}>
                                                [{log.status?.toUpperCase()}]
                                            </span>
                                            <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300">{log.message}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-center py-6 text-xs">Nenhuma execução registrada para este workflow até o momento.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}