// --- MESA DE TRABALHO: DETALHES E WORKFLOW (SENIOR UI) ---
        function abrirDetalhes(id) {
            const t = DB.tarefas.find(x => x.id === id);
            if(!t) return;

            const content = document.getElementById('modal-detalhes-content');
            const respName = DB.usuarios.find(u => u.id === t.responsavelId)?.nome || '--';
            const isAdmin = DB.currentUser.role === 'admin';
            const isOwner = DB.currentUser.id === t.responsavelId;

            // Determinar o ponto atual na timeline visual
            const steps = ['Aberta', 'Aprovada', 'Em execução', 'Concluída', 'Baixada'];
            let currentStepIndex = steps.indexOf(t.status);
            if(t.status === 'Em avaliação') currentStepIndex = 0;
            if(t.status === 'Reprovada' || t.status === 'Cancelada') currentStepIndex = -1; // Estado de erro

            const getDotColor = (index) => {
                if (currentStepIndex === -1) return 'bg-red-500 ring-red-200'; // Erro/Cancelada
                if (index < currentStepIndex) return 'bg-brand-500 ring-brand-100'; // Passou
                if (index === currentStepIndex) return 'bg-amber-500 ring-amber-200 animate-pulse'; // Atual
                return 'bg-slate-200 ring-slate-50'; // Futuro
            };

            // HTML Master do Modal
            let html = `
                <!-- Header do Modal -->
                <div class="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-900 text-white flex-shrink-0 relative overflow-hidden">
                    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-400 via-slate-900 to-slate-900"></div>
                    <div class="relative z-10 flex items-center gap-4">
                        <div class="bg-slate-800 p-2.5 rounded-lg border border-slate-700"><i data-lucide="file-text" class="w-6 h-6 text-brand-400"></i></div>
                        <div>
                            <div class="flex items-center gap-3 mb-1">
                                <span class="text-xs font-black text-slate-400 tracking-widest bg-slate-800 px-2 py-0.5 rounded">${t.id}</span>
                                <span class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(t.status)} shadow-sm">${t.status}</span>
                            </div>
                            <h2 class="text-xl font-bold leading-tight">${t.titulo}</h2>
                        </div>
                    </div>
                    <button onclick="closeModal('modal-detalhes')" class="relative z-10 text-slate-400 hover:text-white bg-slate-800 hover:bg-red-500 p-2 rounded-full transition-all"><i data-lucide="x"></i></button>
                </div>
                
                <div class="flex-1 overflow-y-auto bg-slate-50 flex flex-col lg:flex-row custom-scrollbar">
                    
                    <!-- LADO ESQUERDO: INFORMAÇÕES ESTÁTICAS (Blocos 1, 2 e 3) -->
                    <div class="w-full lg:w-[55%] p-6 lg:p-8 space-y-8 border-r border-slate-200 bg-white">
                        
                        <!-- Timeline Horizontal Minimalista -->
                        <div class="mb-8 hidden sm:block">
                            <p class="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest">Progresso da Ficha</p>
                            <div class="flex items-center justify-between relative">
                                <div class="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
                                <div class="flex flex-col items-center gap-1 bg-white px-2"><div class="w-3 h-3 rounded-full ring-4 ${getDotColor(0)}"></div><span class="text-[9px] font-bold text-slate-500 uppercase">Criada</span></div>
                                <div class="flex flex-col items-center gap-1 bg-white px-2"><div class="w-3 h-3 rounded-full ring-4 ${getDotColor(1)}"></div><span class="text-[9px] font-bold text-slate-500 uppercase">Avaliada</span></div>
                                <div class="flex flex-col items-center gap-1 bg-white px-2"><div class="w-3 h-3 rounded-full ring-4 ${getDotColor(2)}"></div><span class="text-[9px] font-bold text-slate-500 uppercase">Execução</span></div>
                                <div class="flex flex-col items-center gap-1 bg-white px-2"><div class="w-3 h-3 rounded-full ring-4 ${getDotColor(3)}"></div><span class="text-[9px] font-bold text-slate-500 uppercase">Concluída</span></div>
                                <div class="flex flex-col items-center gap-1 bg-white px-2"><div class="w-3 h-3 rounded-full ring-4 ${getDotColor(4)}"></div><span class="text-[9px] font-bold text-slate-500 uppercase">Baixada</span></div>
                            </div>
                        </div>

                        <!-- Detalhes em grade -->
                        <div>
                            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center"><i data-lucide="tag" class="w-4 h-4 mr-2 text-slate-400"></i> Metadados (Blocos 1 e 3)</h3>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div><span class="text-slate-500 block text-[10px] uppercase font-bold">Abertura</span><span class="font-medium text-slate-800">${formatDate(t.dataAbertura)}</span></div>
                                <div><span class="text-slate-500 block text-[10px] uppercase font-bold">Prioridade</span><span class="font-medium text-slate-800">${t.prioridade}</span></div>
                                <div><span class="text-red-500 block text-[10px] uppercase font-bold">Prazo Limite</span><span class="font-black text-red-600 bg-red-50 px-2 py-0.5 rounded">${formatDate(t.prazoLimite)}</span></div>
                                
                                <div><span class="text-slate-500 block text-[10px] uppercase font-bold">Solicitante</span><span class="font-medium text-slate-800">${t.setorSolicitante}</span></div>
                                <div class="sm:col-span-2"><span class="text-slate-500 block text-[10px] uppercase font-bold">Responsável</span><span class="font-medium text-slate-800">${t.setorResponsavel} / ${respName}</span></div>
                                
                                <div><span class="text-slate-500 block text-[10px] uppercase font-bold">Prev. Início</span><span class="font-medium text-slate-800">${formatDate(t.inicioPrevisto)}</span></div>
                                <div><span class="text-slate-500 block text-[10px] uppercase font-bold">Prev. Fim</span><span class="font-medium text-slate-800">${formatDate(t.terminoPrevisto)}</span></div>
                                <div><span class="text-slate-500 block text-[10px] uppercase font-bold">Vínculo / Custos</span><span class="font-medium text-slate-800 text-xs">${t.obraVinculada} ${t.cliente ? `(${t.cliente})` : ''} <br> ${t.geraCusto === 'Sim' ? `${t.tipoCusto} (R$ ${t.valorEstimado})` : 'Sem Custo'}</span></div>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center"><i data-lucide="align-left" class="w-4 h-4 mr-2 text-slate-400"></i> O que deve ser feito (Bloco 2)</h3>
                            ${t.obsInicial ? `<div class="mb-4 bg-blue-50 border border-blue-100 p-3 rounded-lg"><span class="text-blue-600 block text-[10px] uppercase font-bold mb-1">Contexto Inicial</span><span class="italic text-slate-700 text-sm">"${t.obsInicial}"</span></div>` : ''}
                            <p class="text-sm text-slate-700 bg-white border border-slate-200 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">${t.descricao}</p>
                            
                            <div class="mt-4 bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start">
                                <i data-lucide="target" class="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0"></i>
                                <div>
                                    <span class="font-bold text-emerald-800 block text-[10px] uppercase tracking-widest mb-1">Critério de Aceite (Resultado Esperado)</span>
                                    <span class="text-sm font-medium text-emerald-900">${t.resultadoEsperado}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- LADO DIREITO: ÁREA DE TRABALHO E TIMELINE DE AÇÕES (Blocos 4, 5 e 6) -->
                    <div class="w-full lg:w-[45%] p-6 lg:p-8 space-y-6 relative">
            `;

            // Construção dos Blocos de Ação e Histórico
            // Bloco 4 (Avaliação)
            if (t.avaliacao) {
                html += `
                    <div class="relative pl-6 pb-6">
                        <div class="absolute left-1.5 top-8 bottom-0 w-0.5 bg-blue-200"></div>
                        <div class="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">4. Avaliação Direção</h4>
                        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-sm">
                            <p class="mb-1"><span class="font-bold text-slate-700">${t.avaliacao.encaminhamento}</span> por ${t.avaliacao.aprovador}</p>
                            <p class="text-xs text-slate-500 mb-2"><i data-lucide="calendar" class="inline w-3 h-3 mr-1"></i>${formatDate(t.avaliacao.data)}</p>
                            ${t.avaliacao.observacoes ? `<div class="bg-slate-50 p-2 rounded border border-slate-100 italic text-slate-600 text-xs">"${t.avaliacao.observacoes}"</div>` : ''}
                        </div>
                    </div>`;
            } else if (isAdmin && t.status === 'Aberta') {
                html += `
                    <div class="relative pl-6 pb-6">
                        <div class="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-blue-100 animate-pulse"></div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">4. Ação: Avaliar Ficha</h4>
                        <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                            <select id="act-encaminhamento" class="w-full border border-blue-300 rounded-lg p-2.5 text-sm mb-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="Aprovada">Aprovar Ficha para Execução</option>
                                <option value="Aprovada com ajustes">Aprovar com Ressalvas</option>
                                <option value="Reprovada">Reprovar / Cancelar</option>
                            </select>
                            <textarea id="act-obs-direcao" rows="2" placeholder="Observações da direção..." class="w-full border border-blue-300 rounded-lg p-3 text-sm mb-4 outline-none resize-none"></textarea>
                            <button onclick="executarAcao('${t.id}', 'avaliar')" class="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center">
                                <i data-lucide="check-square" class="w-4 h-4 mr-2"></i> Registrar Decisão
                            </button>
                        </div>
                    </div>`;
            }

            // Bloco 5 (Conclusão)
            if (t.conclusao) {
                html += `
                    <div class="relative pl-6 pb-6">
                        <div class="absolute left-1.5 top-8 bottom-0 w-0.5 bg-indigo-200"></div>
                        <div class="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                        <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">5. Execução e Conclusão</h4>
                        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-sm">
                            <p class="mb-1"><span class="font-bold text-slate-700">Entregue</span> por ${t.conclusao.informante}</p>
                            <p class="text-xs text-slate-500 mb-3"><i data-lucide="calendar" class="inline w-3 h-3 mr-1"></i>${formatDate(t.conclusao.data)}</p>
                            <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-slate-700 text-sm whitespace-pre-wrap"><strong>Relatório:</strong><br>${t.conclusao.resumo}</div>
                        </div>
                    </div>`;
            } else if (isOwner && (t.status === 'Aprovada' || t.status === 'Em execução')) {
                if(t.status === 'Aprovada') {
                    html += `
                        <div class="relative pl-6 pb-6">
                            <div class="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100 animate-pulse"></div>
                            <h4 class="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">5. Ação: Iniciar Trabalho</h4>
                            <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center shadow-sm">
                                <i data-lucide="play-circle" class="w-12 h-12 mx-auto text-amber-400 mb-3"></i>
                                <h3 class="text-sm font-bold text-amber-800 mb-2">Pronto para começar?</h3>
                                <p class="text-xs text-amber-700 mb-5">Alerte a equipe que você assumiu esta atividade clicando abaixo.</p>
                                <button onclick="executarAcao('${t.id}', 'iniciar')" class="px-6 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 shadow-md w-full transition-all hover:scale-[1.02]">
                                    Iniciar Execução Agora
                                </button>
                            </div>
                        </div>`;
                } else {
                    html += `
                        <div class="relative pl-6 pb-6">
                            <div class="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-indigo-100 animate-pulse"></div>
                            <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">5. Ação: Entregar Ficha</h4>
                            <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-5 shadow-sm">
                                <label class="block text-xs font-bold text-indigo-900 mb-1.5">Relatório de Conclusão <span class="text-red-500">*</span></label>
                                <textarea id="act-resumo" rows="3" placeholder="Detalhe o que foi resolvido e se o critério de aceite foi atingido..." required class="w-full border border-indigo-300 rounded-lg p-3 text-sm mb-3 outline-none resize-none focus:ring-2 focus:ring-indigo-500"></textarea>
                                <label class="flex items-center text-xs font-medium text-slate-700 mb-4 cursor-pointer p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50">
                                    <input type="checkbox" id="act-evid" class="mr-3 w-4 h-4 text-brand-600 rounded">
                                    Confirmo que as evidências (fotos/docs) foram anexadas fisicamente ou na pasta da rede.
                                </label>
                                <button onclick="executarAcao('${t.id}', 'concluir')" class="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center">
                                    <i data-lucide="send" class="w-4 h-4 mr-2"></i> Enviar Ficha para Baixa
                                </button>
                            </div>
                        </div>`;
                }
            }

            // Bloco 6 (Baixa)
            if (t.baixa) {
                html += `
                    <div class="relative pl-6 pb-2">
                        <div class="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-green-500 ring-4 ring-white"></div>
                        <h4 class="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">6. Encerramento</h4>
                        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-sm">
                            <p class="mb-1"><span class="font-bold text-slate-700">Baixa Aprovada</span> por ${t.baixa.responsavel}</p>
                            <p class="text-xs text-slate-500 mb-3"><i data-lucide="calendar" class="inline w-3 h-3 mr-1"></i>${formatDate(t.baixa.data)}</p>
                            <div class="bg-green-50 p-3 rounded-lg border border-green-100 italic text-slate-700 text-sm">"${t.baixa.parecer}"</div>
                            <div class="mt-4 pt-3 border-t border-slate-100 text-center">
                                <span class="inline-flex items-center px-4 py-1.5 bg-slate-800 text-white font-bold rounded-full text-[10px] uppercase tracking-widest shadow-sm">
                                    <i data-lucide="lock" class="w-3 h-3 mr-2"></i> Ficha Arquivada
                                </span>
                            </div>
                        </div>
                    </div>`;
            } else if (isAdmin && t.status === 'Concluída') {
                html += `
                    <div class="relative pl-6 pb-2">
                        <div class="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-green-500 ring-4 ring-green-100 animate-pulse"></div>
                        <h4 class="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">6. Ação: Baixa Definitiva</h4>
                        <div class="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
                            <label class="block text-xs font-bold text-green-900 mb-1.5">Parecer da Direção <span class="text-red-500">*</span></label>
                            <textarea id="act-parecer" rows="2" placeholder="Avaliação final sobre a entrega..." class="w-full border border-green-300 rounded-lg p-3 text-sm mb-4 outline-none resize-none focus:ring-2 focus:ring-green-500"></textarea>
                            <div class="flex gap-3">
                                <button onclick="executarAcao('${t.id}', 'reabrir')" class="w-1/3 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all flex flex-col items-center justify-center">
                                    <i data-lucide="corner-up-left" class="w-4 h-4 mb-1"></i> Devolver
                                </button>
                                <button onclick="executarAcao('${t.id}', 'baixar')" class="w-2/3 py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-all shadow-md flex items-center justify-center">
                                    <i data-lucide="check-circle-2" class="w-5 h-5 mr-2"></i> Autorizar Baixa
                                </button>
                            </div>
                        </div>
                    </div>`;
            } else if (!t.baixa) {
                 // Cadeado mostrando que a etapa ainda não chegou
                 html += `
                 <div class="relative pl-6 pb-2 opacity-40 grayscale">
                     <div class="absolute left-0 top-1 w-3 h-3 rounded-full bg-slate-300"></div>
                     <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center"><i data-lucide="lock" class="w-3 h-3 mr-1"></i> Etapa Futura</h4>
                     <div class="bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs text-center italic text-slate-400">Aguardando preenchimento das etapas anteriores...</div>
                 </div>`;
            }

            html += `</div></div>`; // Fecha colunas
            content.innerHTML = html;
            lucide.createIcons({ root: content });
            openModal('modal-detalhes');
        }
