import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';

const ALL_STATUSES = [
    'Aguardando',
    'Planejamento',
    'Em Andamento',
    'Bloqueado',
    'Em Testes',
    'Concluído',
    'Cancelado'
];

export default function Index({ auth, projects }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, reset: resetCreate } = useForm({
        title: '',
        applicant: '',
        manager_email: auth?.user?.email || '',
        developer_name: '',
        priority: 'Média',
        status: 'Aguardando',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
        git_link: '',
        description: '',
    });

    const { data: editData, setData: setEditData, patch: patchEdit, processing: editProcessing } = useForm({
        status: '',
        developer_name: '',
        description: '',
        notes: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        postCreate(route('projects.store'), {
            onSuccess: () => {
                resetCreate();
                setIsCreateModalOpen(false);
            },
        });
    };

    const handleOpenManageModal = (project) => {
        setSelectedProject(project);
        setEditData({
            status: project.status,
            developer_name: project.developer_name || '',
            description: project.description || '',
            notes: '',
        });
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        patchEdit(route('projects.update-status', selectedProject.id), {
            onSuccess: () => {
                setSelectedProject(null);
            },
        });
    };

    const totalCount = projects?.length || 0;

    return (
        <AppLayout user={auth?.user}>
            <Head title="Projetos & Demandas" />

            <div className="space-y-4 w-full relative pb-10">
                {/* Faixa superior simplificada e limpa */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Demandas cadastradas:
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                            {totalCount} {totalCount === 1 ? 'registro' : 'registros'}
                        </span>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-500/20 hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Nova Demanda</span>
                    </button>
                </div>

                {/* Tabela de Demandas */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800/40 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-3.5">Código / Demanda</th>
                                    <th className="px-5 py-3.5">Solicitante & Dev</th>
                                    <th className="px-5 py-3.5">Datas</th>
                                    <th className="px-5 py-3.5">Status Atual</th>
                                    <th className="px-5 py-3.5 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {projects && projects.length > 0 ? (
                                    projects.map((project) => (
                                        <tr key={project.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                                            <td className="px-5 py-4">
                                                <div className="font-mono text-[10px] text-red-600 dark:text-red-400 font-bold">{project.code}</div>
                                                <div className="font-bold text-slate-900 dark:text-white text-xs">{project.title}</div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="text-slate-800 dark:text-slate-200 font-medium">Req: {project.applicant}</div>
                                                <div className="text-[10px] text-slate-400">Dev: {project.developer_name || 'Não atribuído'}</div>
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap text-[11px]">
                                                <div>Início: {project.start_date ? new Date(project.start_date).toLocaleDateString('pt-BR') : '-'}</div>
                                                <div>Prazo: {project.due_date ? new Date(project.due_date).toLocaleDateString('pt-BR') : '-'}</div>
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    project.status === 'Bloqueado'
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        : project.status === 'Concluído'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                }`}>
                                                    {project.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => handleOpenManageModal(project)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-700"
                                                >
                                                    ⚙ Ver & Gerenciar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-slate-400">
                                            <p className="text-sm font-medium">Nenhuma demanda cadastrada no momento.</p>
                                            <button 
                                                onClick={() => setIsCreateModalOpen(true)}
                                                className="mt-2 text-xs text-red-600 hover:underline font-semibold"
                                            >
                                                Cadastrar primeira demanda agora
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                
            </div>

            {/* MODAL DE GERENCIAMENTO DA DEMANDA */}
            {selectedProject && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <span className="font-mono text-xs text-red-500 font-bold">{selectedProject.code}</span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedProject.title}</h3>
                            </div>
                            <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕ Fechar</button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Atual / Novo Status</label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData('status', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-red-600 dark:text-red-400 focus:ring-red-500"
                                    >
                                        {ALL_STATUSES.map((st) => (
                                            <option key={st} value={st}>{st}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Desenvolvedor Responsável</label>
                                    <input
                                        type="text"
                                        value={editData.developer_name}
                                        onChange={(e) => setEditData('developer_name', e.target.value)}
                                        placeholder="Ex: João Silva"
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Motivo / Observação da Mudança</label>
                                <input
                                    type="text"
                                    value={editData.notes}
                                    onChange={(e) => setEditData('notes', e.target.value)}
                                    placeholder="Ex: Aguardando aprovação do layout no Figma"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição Completa da Demanda</label>
                                <textarea
                                    rows="3"
                                    value={editData.description}
                                    onChange={(e) => setEditData('description', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                ></textarea>
                            </div>

                            {/* Timeline de Histórico */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Histórico de Alterações de Status</h4>
                                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                    {selectedProject.status_logs && selectedProject.status_logs.length > 0 ? (
                                        selectedProject.status_logs.map((log) => (
                                            <div key={log.id} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[11px] border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.status_from ? `${log.status_from} → ${log.status_to}` : log.status_to}</span>
                                                    <p className="text-[10px] text-slate-400">{log.notes}</p>
                                                </div>
                                                <span className="text-[9px] text-slate-400">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 text-[11px]">Sem histórico registrado.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">Cancelar</button>
                                <button type="submit" disabled={editProcessing} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold shadow-md">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CRIAÇÃO */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg shadow-2xl space-y-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Nova Demanda</h3>
                        <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-500 mb-1">Título</label>
                                <input type="text" value={createData.title} onChange={(e) => setCreateData('title', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-500 mb-1">Solicitante</label>
                                    <input type="text" value={createData.applicant} onChange={(e) => setCreateData('applicant', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" required />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-500 mb-1">E-mail Gestor</label>
                                    <input type="email" value={createData.manager_email} onChange={(e) => setCreateData('manager_email', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-500 mb-1">Data Início</label>
                                    <input type="date" value={createData.start_date} onChange={(e) => setCreateData('start_date', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" required />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-500 mb-1">Prazo Previsto</label>
                                    <input type="date" value={createData.due_date} onChange={(e) => setCreateData('due_date', e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" required />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl">Cancelar</button>
                                <button type="submit" disabled={createProcessing} className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold">Criar Demanda</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}