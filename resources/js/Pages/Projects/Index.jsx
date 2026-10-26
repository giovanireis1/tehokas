import React, { useState } from 'react';   // biblioteca react e hook use state para gerenciar estado do componente
import AppLayout from '@/Layouts/AppLayout';   // alias @, atalho para caminhos configurado no vite.config.js

//importa utilitarios do Inertia.js:  Head para manipular título da página; useForm para gerenciar formulários; router  para fazer requisições http
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

// auth vem automaticamente do middleware HandleInertiaRequests.php e projects vem da controller que contém dados do banco de dados
export default function Index({ auth, projects }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // variavel isCreateModalOpen de leitura modal: carrega modal fechado
    const [selectedProject, setSelectedProject] = useState(null); //variável selectedProject de leitura do projeto atualmente selecionado: inicia como null

    /*
        
        Form Nova Demanda    

        data: createData guarda os valores atuais digitados nos campos.
        setData: setCreateData   Função para atualizar o valor de um campo específico
        post: postCreate função que efetivamente envia a requisição HTTP POST via AJAX para o Laravel (usando a rota projects.store)
        processing: createProcessing Um booleano (true/false) fornecido automaticamente pelo Inertia enquanto a requisição está a caminho. 
                    Serve para desabilitar o botão de envio e evitar múltiplos cliques.
        reset: resetCreate: Função que limpa todos os campos do formulário, retornando-os aos valores iniciais assim que a demanda é criada com sucesso.

    */
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

    /*
         Form Editar Demanda 
    
        data: editData: O objeto que armazena os valores dos campos de edição.
        setData: setEditData: A função usada para atualizar cada campo do formulário de edição (por exemplo, ao mudar a opção no <select> de status).
        patch: patchEdit: A função que envia uma requisição HTTP do tipo PATCH para o Laravel (chamando a rota de atualização de status, como projects.update-status).
        processing: editProcessing: O booleano do Inertia que fica true enquanto a atualização está sendo enviada ao backend, permitindo desabilitar o botão "Salvar Alterações".
    */
   
    const { data: editData, setData: setEditData, patch: patchEdit, processing: editProcessing } = useForm({
        status: '',
        developer_name: '',
        description: '',
        notes: '',
    });

    /*
        escuta evento submit para salvar uma nova demanda
    */
    const handleCreateSubmit = (e) => {
        e.preventDefault(); // previnir comportamento padrão do formulário de atualizaar a página
        postCreate(route('projects.store'), {
            onSuccess: () => {
                resetCreate(); //Vem do Inertia.js, useForm que reseta o formulário
                setIsCreateModalOpen(false); // seta estado da modal para false
            },
        });
    };


    /*
        abertura de modal ao selecionar o projeto
    */
    const handleOpenManageModal = (project) => {
        setSelectedProject(project); // seta variável do projeto
        setEditData({    // seta os valores do formulário
            status: project.status,
            developer_name: project.developer_name || '',
            description: project.description || '',
            notes: '',
        });
    };

     /*
        escuta evento submit para editar a demanda
    */
    
    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        patchEdit(route('projects.update-status', selectedProject.id), {
            onSuccess: () => {
                setSelectedProject(null); // volta para null projeto selecionado ao edtiar
            },
        });
    };

    return (
        <AppLayout user={auth?.user} title="Gestão de Demandas">
            <Head title="Demandas" />

            <div className="space-y-6 w-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Central de Demandas & Projetos</h2>
                        <p className="text-xs text-slate-400">Clique em "Ver & Gerenciar" para alterar status, responsável ou ver o cronograma.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-500/20 transition cursor-pointer"
                    >
                        + Nova Demanda
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
                                        <td colSpan="5" className="text-center py-8 text-slate-400">
                                            Nenhuma demanda cadastrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL DE GERENCIAMENTO DA DEMANDA (DETALHES + SELECT DE STATUS) */}
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