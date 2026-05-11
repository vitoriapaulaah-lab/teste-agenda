// --- CONEXÃO COM O SUPABASE ---
        var supabaseUrl = 'https://pwmgbaxywvyyfmlkygqr.supabase.co';
        var supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bWdiYXh5d3Z5eWZtbGt5Z3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNDI3NDAsImV4cCI6MjA5MjkxODc0MH0.kSYonDj0VBHjMZuVlGeVQjAuMmbEBMQfB4OsBcZOecg';
        
        // Inicializa apontando para o schema que criamos no SQL
        var supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'gestao_atividades' }
        });

        /**
         * ARQUITETURA DE DADOS (Simulando Banco de Dados Real com LocalStorage)
         * O LocalStorage permite que os dados persistam mesmo se a página recarregar.
         */
        var STORAGE_KEY = 'taticoPro_v2_data';
        var currentAdminTab = 'avaliacao'; // Guarda a aba atual do admin
        var currentChart = null;

        // Dados base (usados caso seja o primeiro acesso)
        var defaultData = {
            listas: {
                prioridade: ['Baixa', 'Média', 'Alta'],
                status: ['Aberta', 'Em avaliação', 'Aprovada', 'Em execução', 'Concluída', 'Baixada', 'Cancelada', 'Reprovada'],
                setores: ['Comercial', 'Sala Técnica', 'Produção', 'Serviços', 'Locação', 'Administrativo', 'Financeiro', 'Compras', 'PD&I', 'Automação', 'Direção'],
                tipoCusto: ['Sem custo', 'Material', 'Mão de obra interna', 'Terceiros', 'Deslocamento', 'Locação', 'Serviço externo', 'Outro']
            },
            usuarios: [
                { id: 1, nome: 'Diretoria Executiva', role: 'admin', setor: 'Direção' },
                { id: 2, nome: 'João Técnico', role: 'user', setor: 'Sala Técnica' },
                { id: 3, nome: 'Maria Comercial', role: 'user', setor: 'Comercial' }
            ],
            currentUser: { id: 1, nome: 'Diretoria Executiva', role: 'admin', setor: 'Direção' },
            tarefas: [] // Inicia vazio e popula com exemplos se necessário
        };

        var DB = {}; // Nosso banco em memória

        // --- INICIALIZAÇÃO DO SISTEMA ---
        document.addEventListener('DOMContentLoaded', () => {
            initDatabase();
            lucide.createIcons();
            populateForms();
            updateUIForRole();
            navigate('dashboard');
            
            // Log silencioso confirmando que a variável supabase está ativa
            console.log("Cliente Supabase Inicializado:", supabaseClient);
        });

        function initDatabase() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                DB = JSON.parse(saved);
            } else {
                DB = JSON.parse(JSON.stringify(defaultData));
                // Criar um dado inicial para visualização se for a primeira vez
                if(DB.tarefas.length === 0) seedInitialData();
                saveDatabase();
            }
        }

        function saveDatabase() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
            updateBadges(); // Sempre que salva, atualiza os contadores
        }

        // Dados de exemplo para o primeiro acesso
        function seedInitialData() {
            DB.tarefas = [
                {
                    id: 'TK-1001', dataAbertura: '2026-05-01', prioridade: 'Alta', status: 'Em execução',
                    setorSolicitante: 'Administrativo', setorResponsavel: 'Sala Técnica', responsavelId: 2,
                    obsInicial: 'Equipamento parando.',
                    titulo: 'Manutenção do Servidor B', descricao: 'Trocar HDs e fonte.', resultadoEsperado: 'Servidor online.',
                    inicioPrevisto: '2026-05-05', terminoPrevisto: '2026-05-06', prazoLimite: '2026-05-10',
                    obraVinculada: 'Não', cliente: '', local: '', geraCusto: 'Sim', tipoCusto: 'Material', valorEstimado: '1500.00',
                    avaliacao: { data: '2026-05-02', aprovador: 'Diretoria Executiva', encaminhamento: 'Aprovada', observacoes: 'Urgente.' },
                    conclusao: null, baixa: null
                },
                {
                    id: 'TK-1002', dataAbertura: '2026-05-10', prioridade: 'Média', status: 'Concluída',
                    setorSolicitante: 'Direção', setorResponsavel: 'Comercial', responsavelId: 3,
                    obsInicial: '', titulo: 'Proposta Cliente X', descricao: 'Fazer orçamento detalhado.', resultadoEsperado: 'Proposta enviada.',
                    inicioPrevisto: '2026-05-11', terminoPrevisto: '2026-05-12', prazoLimite: '2026-05-15',
                    obraVinculada: 'Sim', cliente: 'Construtora Alfa', local: 'Sede', geraCusto: 'Não',
                    avaliacao: { data: '2026-05-10', aprovador: 'Diretoria Executiva', encaminhamento: 'Aprovada', observacoes: '' },
                    conclusao: { data: '2026-05-12', informante: 'Maria Comercial', resumo: 'Enviado por e-mail, cliente acusou recebimento.', evidencia: 'Sim' },
                    baixa: null
                },
                {
                    id: 'TK-1003', dataAbertura: new Date().toISOString().split('T')[0], prioridade: 'Baixa', status: 'Aberta',
                    setorSolicitante: 'Produção', setorResponsavel: 'Compras', responsavelId: 2,
                    obsInicial: 'Reposição.', titulo: 'Compra de EPIs', descricao: 'Comprar 10 capacetes.', resultadoEsperado: 'EPIs no almoxarifado.',
                    inicioPrevisto: '', terminoPrevisto: '', prazoLimite: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
                    obraVinculada: 'Não', geraCusto: 'Sim', tipoCusto: 'Material', valorEstimado: '300.00',
                    avaliacao: null, conclusao: null, baixa: null
                }
            ];
        }

        // --- SISTEMA DE NOTIFICAÇÕES (TOASTS) ---
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const styles = {
                success: 'bg-white border-l-4 border-green-500 text-slate-800',
                error: 'bg-white border-l-4 border-red-500 text-slate-800',
                info: 'bg-white border-l-4 border-blue-500 text-slate-800'
            };
            
            const icons = {
                success: '<i data-lucide="check-circle" class="text-green-500 w-5 h-5 mr-3"></i>',
                error: '<i data-lucide="alert-circle" class="text-red-500 w-5 h-5 mr-3"></i>',
                info: '<i data-lucide="info" class="text-blue-500 w-5 h-5 mr-3"></i>'
            };

            toast.className = `flex items-center p-4 rounded-lg shadow-xl min-w-[300px] toast-enter transition-all ${styles[type]}`;
            toast.innerHTML = `${icons[type]}<span class="font-medium text-sm">${message}</span>`;
            
            container.appendChild(toast);
            lucide.createIcons({ root: toast });
            
            // Ativa a animação
            requestAnimationFrame(() => toast.classList.add('toast-enter-active'));
            
            // Remove após 3 segundos
            setTimeout(() => {
                toast.classList.remove('toast-enter-active');
                toast.classList.add('toast-exit');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // --- UTILIDADES ---
        const formatDate = (dateStr) => {
            if(!dateStr) return '--/--/----';
            const [y, m, d] = dateStr.split('-');
            return `${d}/${m}/${y}`;
        };

        const isOverdue = (limitDate) => {
            if(!limitDate) return false;
            // Zera as horas para comparar apenas os dias
            const limit = new Date(limitDate + 'T00:00:00');
            const hoje = new Date();
            hoje.setHours(0,0,0,0);
            return limit < hoje;
        };

        function getStatusColor(status) {
            const map = {
                'Aberta': 'bg-slate-100 text-slate-600 border-slate-200',
                'Em avaliação': 'bg-blue-50 text-blue-700 border-blue-200',
                'Aprovada': 'bg-teal-50 text-teal-700 border-teal-200',
                'Em execução': 'bg-amber-50 text-amber-700 border-amber-200',
                'Concluída': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                'Baixada': 'bg-green-50 text-green-700 border-green-200',
                'Reprovada': 'bg-red-50 text-red-700 border-red-200',
                'Cancelada': 'bg-slate-800 text-slate-300 border-slate-700'
            };
            return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
        }

        function getPriorityColor(priority) {
            const map = {
                'Alta': 'bg-red-50 text-red-700 border-red-200',
                'Média': 'bg-amber-50 text-amber-700 border-amber-200',
                'Baixa': 'bg-slate-50 text-slate-600 border-slate-200'
            };
            return map[priority] || 'bg-slate-50 text-slate-600 border-slate-200';
        }

        function getNextActionText(tarefa) {
            if(!tarefa) return 'Sem ação definida';
            if(tarefa.status === 'Aberta' || tarefa.status === 'Em avaliação') return 'Direção deve avaliar';
            if(tarefa.status === 'Aprovada') return 'Executor deve iniciar';
            if(tarefa.status === 'Em execução') return 'Executor deve concluir';
            if(tarefa.status === 'Concluída') return 'Direção deve dar baixa';
            if(tarefa.status === 'Baixada') return 'Ficha encerrada';
            if(tarefa.status === 'Reprovada') return 'Ficha reprovada';
            if(tarefa.status === 'Cancelada') return 'Ficha cancelada';
            return 'Acompanhar status';
        }

        function getNextActionBadge(tarefa) {
            const text = getNextActionText(tarefa);
            const map = {
                'Direção deve avaliar': 'bg-blue-50 text-blue-700 border-blue-200',
                'Executor deve iniciar': 'bg-teal-50 text-teal-700 border-teal-200',
                'Executor deve concluir': 'bg-amber-50 text-amber-700 border-amber-200',
                'Direção deve dar baixa': 'bg-green-50 text-green-700 border-green-200',
                'Ficha encerrada': 'bg-slate-100 text-slate-600 border-slate-200',
                'Ficha reprovada': 'bg-red-50 text-red-700 border-red-200',
                'Ficha cancelada': 'bg-slate-800 text-slate-300 border-slate-700'
            };
            return `<span class="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${map[text] || 'bg-slate-50 text-slate-600 border-slate-200'}">${text}</span>`;
        }

        function diasAtePrazo(limitDate) {
            if(!limitDate) return null;
            const limit = new Date(limitDate + 'T00:00:00');
            const hoje = new Date();
            hoje.setHours(0,0,0,0);
            return Math.round((limit - hoje) / 86400000);
        }

        function getPrazoMicrocopy(limitDate, status) {
            if(!limitDate) return 'Sem prazo definido';
            if(['Baixada', 'Cancelada', 'Reprovada'].includes(status)) return 'Sem ação pendente';
            const diff = diasAtePrazo(limitDate);
            if(diff === null) return 'Sem prazo definido';
            if(diff < 0) return `${Math.abs(diff)} dia(s) vencida`;
            if(diff === 0) return 'Vence hoje';
            if(diff === 1) return 'Vence amanhã';
            return `${diff} dia(s) restantes`;
        }

        function closeSidebarOnMobile() {
            if (window.innerWidth >= 1024) return;
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            if (!sidebar || !overlay || sidebar.classList.contains('-translate-x-full')) return;
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }

        function abrirFilaDirecao(tab) {
            if (DB.currentUser.role !== 'admin') {
                showToast('Apenas a Direção acessa esta fila.', 'info');
                return;
            }
            currentAdminTab = tab || 'avaliacao';
            navigate('admin');
        }

        function focarDashboard(tipo) {
            if(tipo === 'todas') {
                if (DB.currentUser.role === 'admin') abrirFilaDirecao('todas');
                else navigate('user-tasks');
                return;
            }

            if(tipo === 'direcao') {
                abrirFilaDirecao('avaliacao');
                return;
            }

            if(tipo === 'execucao') {
                navigate('user-tasks');
                const status = document.getElementById('filter-user-status');
                if(status) { status.value = 'Em execução'; renderUserTasks(); }
                return;
            }

            if(tipo === 'atrasadas') {
                if (DB.currentUser.role === 'admin') {
                    currentAdminTab = 'todas';
                    navigate('admin');
                    const prazo = document.getElementById('filter-admin-prazo');
                    if(prazo) { prazo.value = 'vencidas'; renderAdminTable(currentAdminTab); }
                } else {
                    navigate('user-tasks');
                }
            }
        }

        // --- SISTEMA DE UI E NAVEGAÇÃO ---
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            const isClosed = sidebar.classList.contains('-translate-x-full');
            
            if (isClosed) {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
                setTimeout(() => overlay.classList.remove('opacity-0'), 10);
            } else {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            }
        }

        function toggleUserRole() {
            // Alterna ciclicamente entre os usuários mockados
            const currentIndex = DB.usuarios.findIndex(u => u.id === DB.currentUser.id);
            const nextIndex = (currentIndex + 1) % DB.usuarios.length;
            DB.currentUser = DB.usuarios[nextIndex];
            
            saveDatabase();
            updateUIForRole();
            showToast(`Sessão alterada para: ${DB.currentUser.nome}`, 'info');
            navigate(DB.currentUser.role === 'admin' ? 'dashboard' : 'user-tasks');
        }

        function updateBadges() {
            // Contadores da Sidebar e Abas
            const myTasksCount = DB.tarefas.filter(t => t.responsavelId === DB.currentUser.id && t.status !== 'Baixada' && t.status !== 'Cancelada' && t.status !== 'Reprovada').length;
            const adminPending = DB.tarefas.filter(t => t.status === 'Aberta' || t.status === 'Em avaliação' || t.status === 'Concluída').length;
            
            const avCount = DB.tarefas.filter(t => t.status === 'Aberta' || t.status === 'Em avaliação').length;
            const bxCount = DB.tarefas.filter(t => t.status === 'Concluída').length;

            const updateBadge = (id, count) => {
                const el = document.getElementById(id);
                if(el) { el.innerText = count; el.style.display = count > 0 ? 'inline-block' : 'none'; }
            };

            updateBadge('badge-minhas', myTasksCount);
            updateBadge('badge-admin', adminPending);
            updateBadge('badge-tab-av', avCount);
            updateBadge('badge-tab-bx', bxCount);
        }

        function updateUIForRole() {
            document.getElementById('user-name').innerText = DB.currentUser.nome;
            const isAdm = DB.currentUser.role === 'admin';
            
            document.getElementById('user-role-badge').innerHTML = isAdm ? 
                '<i data-lucide="shield" class="w-3 h-3"></i> Direção / Admin' : 
                '<i data-lucide="wrench" class="w-3 h-3 text-emerald-400"></i> Colaborador';
            
            document.getElementById('user-avatar').innerText = DB.currentUser.nome.charAt(0);
            document.getElementById('user-avatar').className = `w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-inner ring-2 transition-colors ${isAdm ? 'bg-slate-800 ring-slate-600' : 'bg-emerald-600 ring-emerald-400'}`;
            
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdm ? 'flex' : 'none');
            updateBadges();
            lucide.createIcons();
        }

        function navigate(viewId) {
            // Fecha sidebar no mobile ao navegar sem alternar indevidamente
            closeSidebarOnMobile();

            // Menu ativo
            document.querySelectorAll('aside nav button').forEach(btn => {
                btn.className = "w-full flex items-center px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-medium";
            });
            const activeBtn = document.getElementById(`nav-${viewId}`);
            if(activeBtn) activeBtn.className = "w-full flex items-center px-4 py-3.5 rounded-xl bg-brand-600 text-white transition-all shadow-md shadow-brand-500/20 font-medium";

            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = '';
            
            // Titulos Dinâmicos
            const titles = {
                'dashboard': { title: 'Visão Geral do Setor Tático', sub: 'Panorama executivo com atalhos para as filas de trabalho.' },
                'user-tasks': { title: 'Minhas Execuções', sub: 'Atividades atribuídas a você e seus próximos passos.' },
                'admin': { title: 'Mesa de Aprovações e Baixas', sub: 'Fila de decisão da Direção: aprovar, baixar ou devolver.' }
            };
            document.getElementById('page-title').innerText = titles[viewId].title;
            document.getElementById('page-subtitle').innerText = titles[viewId].sub;
            
            const tpl = document.getElementById(`tpl-${viewId}`).content.cloneNode(true);
            mainContent.appendChild(tpl);

            if (viewId === 'dashboard') renderDashboardData();
            if (viewId === 'user-tasks') renderUserTasks();
            if (viewId === 'admin') renderAdminTable(currentAdminTab); 
            
            lucide.createIcons();
        }

        // --- FORMULÁRIOS E MODAIS ---
        function populateForms() {
            const { setores, tipoCusto } = DB.listas;
            
            const fillSelect = (id, data) => {
                const sel = document.getElementById(id);
                sel.innerHTML = ''; // Limpa
                data.forEach(item => sel.add(new Option(item, item)));
            };

            fillSelect('nt-setor-solicitante', setores);
            fillSelect('nt-setor-resp', setores);
            fillSelect('nt-tipo-custo', tipoCusto);

            // Popula responsáveis (Apenas roles 'user')
            const selResp = document.getElementById('nt-responsavel');
            selResp.innerHTML = '';
            DB.usuarios.filter(u => u.role === 'user').forEach(u => selResp.add(new Option(u.nome, u.id)));
        }

        function toggleFormFields() {
            const isObra = document.getElementById('nt-obra').value === 'Sim';
            document.getElementById('div-cliente').classList.toggle('hidden', !isObra);
            document.getElementById('div-local').classList.toggle('hidden', !isObra);
            
            const isCusto = document.getElementById('nt-gera-custo').value === 'Sim';
            document.getElementById('div-tipo-custo').classList.toggle('hidden', !isCusto);
            document.getElementById('div-valor').classList.toggle('hidden', !isCusto);
            
            // Se ocultou, limpa os valores
            if(!isObra) { document.getElementById('nt-cliente').value = ''; document.getElementById('nt-local').value = ''; }
            if(!isCusto) { document.getElementById('nt-valor').value = ''; }
        }

        function openModal(id) {
            const modal = document.getElementById(id);
            modal.classList.remove('hidden');
            // Pequeno timeout para o navegador processar a remoção do display:none antes de animar a opacidade
            requestAnimationFrame(() => {
                modal.classList.remove('opacity-0');
                modal.firstElementChild.classList.add('modal-enter-active');
            });
        }

        function closeModal(id) {
            const modal = document.getElementById(id);
            modal.classList.add('opacity-0');
            modal.firstElementChild.classList.remove('modal-enter-active');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }

        // --- LÓGICA CORE: CRIAÇÃO E WORKFLOW ---
        function criarTarefa() {
            // Validação customizada
            const limite = document.getElementById('nt-prazo-limite').value;
            const inicioPrev = document.getElementById('nt-inicio-prev').value;
            const terminoPrev = document.getElementById('nt-termino-prev').value;
            const vinculoObra = document.getElementById('nt-obra').value;
            const geraCusto = document.getElementById('nt-gera-custo').value;
            const clienteObra = document.getElementById('nt-cliente').value.trim();
            const valorCusto = document.getElementById('nt-valor').value;

            if(!limite) {
                showToast("O prazo limite é obrigatório!", "error");
                return;
            }

            if(inicioPrev && terminoPrev && inicioPrev > terminoPrev) {
                showToast("A data de início não pode ser posterior ao término previsto.", "error");
                return;
            }

            if(terminoPrev && limite && terminoPrev > limite) {
                showToast("O término previsto não deve ultrapassar o prazo limite.", "error");
                return;
            }

            if(vinculoObra === 'Sim' && !clienteObra) {
                showToast("Informe o nome da obra/cliente quando houver vínculo com obra.", "error");
                return;
            }

            if(geraCusto === 'Sim' && (!valorCusto || Number(valorCusto) <= 0)) {
                showToast("Informe um valor estimado válido para custos extras.", "error");
                return;
            }

            const nova = {
                id: `TK-${1000 + DB.tarefas.length + 1}`,
                dataAbertura: new Date().toISOString().split('T')[0],
                status: 'Aberta', 
                prioridade: document.getElementById('nt-prioridade').value,
                titulo: document.getElementById('nt-titulo').value,
                setorSolicitante: document.getElementById('nt-setor-solicitante').value,
                setorResponsavel: document.getElementById('nt-setor-resp').value,
                responsavelId: parseInt(document.getElementById('nt-responsavel').value),
                obsInicial: document.getElementById('nt-obs-inicial').value,
                descricao: document.getElementById('nt-descricao').value,
                resultadoEsperado: document.getElementById('nt-resultado').value,
                inicioPrevisto: inicioPrev,
                terminoPrevisto: terminoPrev,
                prazoLimite: limite,
                obraVinculada: vinculoObra,
                cliente: clienteObra,
                local: document.getElementById('nt-local').value,
                geraCusto: geraCusto,
                tipoCusto: document.getElementById('nt-tipo-custo').value,
                valorEstimado: valorCusto,
                avaliacao: null, conclusao: null, baixa: null
            };
            
            DB.tarefas.unshift(nova);
            saveDatabase(); // Persiste no LocalStorage
            
            closeModal('modal-nova-tarefa');
            document.getElementById('form-nova-tarefa').reset();
            toggleFormFields();
            showToast(`Ficha ${nova.id} criada e enviada para aprovação!`, 'success');
            
            navigate(document.querySelector('aside nav button.bg-brand-600').id.replace('nav-', ''));
        }

        // --- RENDERIZAÇÃO DAS VIEWS ---
        
        function renderDashboardData() {
            document.getElementById('dash-total').innerText = DB.tarefas.length;
            document.getElementById('dash-execucao').innerText = DB.tarefas.filter(t => t.status === 'Em execução').length;
            document.getElementById('dash-pendentes').innerText = DB.tarefas.filter(t => t.status === 'Aberta' || t.status === 'Concluída').length;
            document.getElementById('dash-atraso').innerText = DB.tarefas.filter(t => isOverdue(t.prazoLimite) && t.status !== 'Baixada' && t.status !== 'Cancelada' && t.status !== 'Reprovada').length;

            const tbody = document.getElementById('dash-table-body');
            tbody.innerHTML = '';

            if(DB.tarefas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-slate-400">
                    <div class="flex flex-col items-center">
                        <i data-lucide="inbox" class="w-10 h-10 mb-2 opacity-40"></i>
                        <p class="font-medium text-slate-500">Nenhuma ficha registrada ainda.</p>
                        <p class="text-xs text-slate-400 mt-1">Crie a primeira ficha para começar o acompanhamento.</p>
                    </div>
                </td></tr>`;
            } else {
                DB.tarefas.slice(0, 6).forEach(t => {
                    const respName = DB.usuarios.find(u => u.id === t.responsavelId)?.nome || '--';
                    const isLate = isOverdue(t.prazoLimite) && !['Baixada', 'Cancelada', 'Reprovada'].includes(t.status);
                    const prazoText = getPrazoMicrocopy(t.prazoLimite, t.status);

                    tbody.innerHTML += `
                        <tr class="hover:bg-slate-50 cursor-pointer transition-colors group" onclick="abrirDetalhes('${t.id}')">
                            <td class="py-3 px-4 font-bold text-slate-700" data-label="Ficha / ID">${t.id}</td>
                            <td class="py-3 px-4 truncate max-w-[190px] font-medium text-slate-800" data-label="Resumo" title="${t.titulo}">
                                <span class="group-hover:text-brand-600 transition-colors">${t.titulo}</span>
                                <div class="mt-1"><span class="px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityColor(t.prioridade)}">${t.prioridade}</span></div>
                            </td>
                            <td class="py-3 px-4 text-slate-500" data-label="Executor">${respName}</td>
                            <td class="py-3 px-4" data-label="Status"><span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(t.status)}">${t.status}</span></td>
                            <td class="py-3 px-4" data-label="Próximo passo">${getNextActionBadge(t)}</td>
                            <td class="py-3 px-4 ${isLate ? 'text-red-600 font-bold' : 'text-slate-600'}" data-label="Prazo">
                                <div class="flex items-center">
                                    ${formatDate(t.prazoLimite)} ${isLate ? '<i data-lucide="alert-triangle" class="w-3 h-3 ml-1"></i>' : ''}
                                </div>
                                <p class="text-[10px] ${isLate ? 'text-red-500' : 'text-slate-400'} mt-1">${prazoText}</p>
                            </td>
                        </tr>
                    `;
                });
            }

            // Gráfico Chart.js Moderno
            const ctx = document.getElementById('chartStatus');
            if(ctx) {
                if(currentChart) currentChart.destroy();
                const counts = {};
                DB.tarefas.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);

                currentChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(counts),
                        datasets: [{ 
                            data: Object.values(counts), 
                            backgroundColor: ['#e2e8f0', '#bfdbfe', '#99f6e4', '#fde68a', '#c7d2fe', '#bbf7d0', '#fecaca', '#334155'], 
                            hoverOffset: 4,
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        cutout: '70%',
                        plugins: { 
                            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: {family: 'Inter', size: 11} } } 
                        } 
                    }
                });
            }
            lucide.createIcons();
        }

        function renderUserTasks() {
            const grid = document.getElementById('user-tasks-grid');
            const searchObj = document.getElementById('search-user');
            const statusObj = document.getElementById('filter-user-status');
            const priorityObj = document.getElementById('filter-user-priority');
            const term = searchObj ? searchObj.value.toLowerCase() : '';
            const statusFilter = statusObj ? statusObj.value : '';
            const priorityFilter = priorityObj ? priorityObj.value : '';

            let myTasks = DB.tarefas.filter(t => t.responsavelId === DB.currentUser.id && !['Baixada', 'Cancelada', 'Reprovada'].includes(t.status));

            if(term) {
                myTasks = myTasks.filter(t => t.titulo.toLowerCase().includes(term) || t.id.toLowerCase().includes(term));
            }

            if(statusFilter) {
                myTasks = myTasks.filter(t => t.status === statusFilter);
            }

            if(priorityFilter) {
                myTasks = myTasks.filter(t => t.prioridade === priorityFilter);
            }

            // Ordena a fila para reduzir risco operacional: vencidas, prioridade alta e prazo mais próximo.
            myTasks.sort((a, b) => {
                const overdueDiff = Number(isOverdue(b.prazoLimite)) - Number(isOverdue(a.prazoLimite));
                if(overdueDiff !== 0) return overdueDiff;
                const prioridadePeso = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
                const prioDiff = (prioridadePeso[b.prioridade] || 0) - (prioridadePeso[a.prioridade] || 0);
                if(prioDiff !== 0) return prioDiff;
                return (a.prazoLimite || '9999-12-31').localeCompare(b.prazoLimite || '9999-12-31');
            });

            grid.innerHTML = '';
            if(!myTasks.length) {
                grid.innerHTML = `<div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    <i data-lucide="check-circle-2" class="w-12 h-12 mb-3 text-emerald-400 opacity-50"></i>
                    <p class="font-medium text-slate-500">Nenhuma ficha encontrada para esta visão.</p>
                    <p class="text-xs text-slate-400 mt-2 max-w-md text-center">Sua fila pode estar limpa ou os filtros aplicados não retornaram resultados. Ajuste a busca para ver outras atividades.</p>
                </div>`;
                lucide.createIcons();
                return;
            }

            myTasks.forEach(t => {
                const isLate = isOverdue(t.prazoLimite);
                const borderStatus = isLate ? 'border-red-400 shadow-red-500/10' : 'border-slate-200 hover:border-brand-300';
                const prazoText = getPrazoMicrocopy(t.prazoLimite, t.status);

                grid.innerHTML += `
                    <div class="bg-white border-2 ${borderStatus} rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all relative flex flex-col group">
                        ${isLate ? '<div class="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md animate-pulse uppercase tracking-wider">Atrasada</div>' : ''}

                        <div class="flex justify-between items-center mb-3 gap-2">
                            <span class="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">${t.id}</span>
                            <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(t.status)}">${t.status}</span>
                        </div>

                        <div class="mb-3 flex flex-wrap gap-2">
                            <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getPriorityColor(t.prioridade)}">Prioridade ${t.prioridade}</span>
                            ${getNextActionBadge(t)}
                        </div>

                        <h4 class="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-brand-600 transition-colors">${t.titulo}</h4>
                        <p class="text-sm text-slate-500 line-clamp-2 mb-5 flex-1">${t.descricao}</p>

                        <div class="rounded-xl bg-slate-50 border border-slate-100 p-3 mb-4">
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Critério de aceite</span>
                            <p class="text-xs font-medium text-slate-700 line-clamp-2">${t.resultadoEsperado}</p>
                        </div>

                        <div class="border-t border-slate-100 pt-4 flex justify-between items-center mt-auto">
                            <div class="flex flex-col">
                                <span class="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Prazo Limite</span>
                                <span class="text-sm font-bold ${isLate ? 'text-red-600' : 'text-slate-700'} flex items-center">
                                    <i data-lucide="calendar" class="w-3 h-3 mr-1 opacity-70"></i> ${formatDate(t.prazoLimite)}
                                </span>
                                <span class="text-[10px] ${isLate ? 'text-red-500' : 'text-slate-400'} mt-0.5">${prazoText}</span>
                            </div>
                            <button onclick="abrirDetalhes('${t.id}')" class="bg-slate-900 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center">
                                Abrir Ficha <i data-lucide="arrow-right" class="w-3 h-3 ml-1"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            lucide.createIcons();
        }

        function renderAdminTable(filterTab) {
            currentAdminTab = filterTab;

            // Controle visual das abas
            document.querySelectorAll('.admin-tab').forEach(btn => {
                btn.className = "admin-tab relative px-5 py-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-800 transition-all whitespace-nowrap flex items-center";
            });

            const activeClass = "admin-tab relative px-5 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center bg-white shadow-sm ring-1 ring-slate-200 z-10 ";
            if(filterTab === 'avaliacao') document.getElementById('tab-avaliacao').className = activeClass + "text-blue-600";
            if(filterTab === 'baixa') document.getElementById('tab-baixa').className = activeClass + "text-green-600";
            if(filterTab === 'todas') document.getElementById('tab-todas').className = activeClass + "text-slate-800";

            const tbody = document.getElementById('admin-table-body');
            const searchObj = document.getElementById('search-admin');
            const statusObj = document.getElementById('filter-admin-status');
            const priorityObj = document.getElementById('filter-admin-priority');
            const prazoObj = document.getElementById('filter-admin-prazo');
            const term = searchObj ? searchObj.value.toLowerCase() : '';
            const statusFilter = statusObj ? statusObj.value : '';
            const priorityFilter = priorityObj ? priorityObj.value : '';
            const prazoFilter = prazoObj ? prazoObj.value : '';

            let list = DB.tarefas;
            if(filterTab === 'avaliacao') list = DB.tarefas.filter(t => t.status === 'Aberta' || t.status === 'Em avaliação');
            if(filterTab === 'baixa') list = DB.tarefas.filter(t => t.status === 'Concluída');

            if(term) list = list.filter(t => t.titulo.toLowerCase().includes(term) || t.id.toLowerCase().includes(term));
            if(statusFilter) list = list.filter(t => t.status === statusFilter);
            if(priorityFilter) list = list.filter(t => t.prioridade === priorityFilter);
            if(prazoFilter === 'vencidas') list = list.filter(t => isOverdue(t.prazoLimite) && !['Baixada', 'Cancelada', 'Reprovada'].includes(t.status));
            if(prazoFilter === 'em-dia') list = list.filter(t => !isOverdue(t.prazoLimite) || ['Baixada', 'Cancelada', 'Reprovada'].includes(t.status));

            list.sort((a, b) => {
                const overdueDiff = Number(isOverdue(b.prazoLimite) && !['Baixada', 'Cancelada', 'Reprovada'].includes(b.status)) - Number(isOverdue(a.prazoLimite) && !['Baixada', 'Cancelada', 'Reprovada'].includes(a.status));
                if(overdueDiff !== 0) return overdueDiff;
                const prioridadePeso = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
                const prioDiff = (prioridadePeso[b.prioridade] || 0) - (prioridadePeso[a.prioridade] || 0);
                if(prioDiff !== 0) return prioDiff;
                return (a.prazoLimite || '9999-12-31').localeCompare(b.prazoLimite || '9999-12-31');
            });

            tbody.innerHTML = '';
            if(!list.length) {
                tbody.innerHTML = `<tr><td colspan="6" class="py-12 text-center text-slate-400 bg-slate-50/50">
                    <i data-lucide="check-circle" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
                    <p class="font-medium text-slate-500">Nenhuma ficha encontrada para esta visão.</p>
                    <p class="text-xs text-slate-400 mt-1">Quando uma ficha chegar nesta etapa, ela aparecerá aqui. Você também pode ajustar os filtros.</p>
                </td></tr>`;
                lucide.createIcons();
                return;
            }

            list.forEach(t => {
                const respName = DB.usuarios.find(u => u.id === t.responsavelId)?.nome || '--';
                const isLate = isOverdue(t.prazoLimite) && !['Baixada', 'Cancelada', 'Reprovada'].includes(t.status);
                const prazoText = getPrazoMicrocopy(t.prazoLimite, t.status);

                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 group">
                        <td class="py-4 px-6" data-label="Ficha e Título">
                            <p class="font-black text-slate-800 text-sm mb-0.5 group-hover:text-brand-600 transition-colors">${t.id}</p>
                            <p class="text-xs text-slate-500 truncate max-w-[250px]" title="${t.titulo}">${t.titulo}</p>
                            <span class="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getPriorityColor(t.prioridade)}">${t.prioridade}</span>
                        </td>
                        <td class="py-4 px-6" data-label="Setores">
                            <p class="text-xs text-slate-700 font-semibold flex items-center mb-0.5" title="Solicitante"><i data-lucide="arrow-up-right" class="w-3 h-3 mr-1 text-slate-400"></i> ${t.setorSolicitante}</p>
                            <p class="text-xs text-slate-500 flex items-center" title="Executor"><i data-lucide="user" class="w-3 h-3 mr-1 text-brand-400"></i> ${respName}</p>
                        </td>
                        <td class="py-4 px-6" data-label="Status"><span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(t.status)} shadow-sm">${t.status}</span></td>
                        <td class="py-4 px-6" data-label="Próximo passo">${getNextActionBadge(t)}</td>
                        <td class="py-4 px-6 text-xs" data-label="Prazos">
                            <div class="flex flex-col gap-1">
                                <span class="text-slate-500">Início: <span class="font-medium text-slate-700">${formatDate(t.inicioPrevisto)}</span></span>
                                <span class="${isLate ? 'text-red-600 font-bold bg-red-50 inline-block px-1 rounded' : 'text-slate-500'}">Limite: ${formatDate(t.prazoLimite)}</span>
                                <span class="${isLate ? 'text-red-500 font-bold' : 'text-slate-400'}">${prazoText}</span>
                            </div>
                        </td>
                        <td class="py-4 px-6 text-right" data-label="Ação">
                            <button onclick="abrirDetalhes('${t.id}')" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 transition-all shadow-sm">
                                ${filterTab === 'todas' ? 'Visualizar' : 'Analisar Ficha'}
                            </button>
                        </td>
                    </tr>
                `;
            });
            lucide.createIcons();
        }

        // --- MESA DE TRABALHO: DETALHES E WORKFLOW (SENIOR UI) ---
        function abrirDetalhes(id) {
            const t = DB.tarefas.find(x => x.id === id);
            if(!t) return;

            const content = document.getElementById('modal-detalhes-content');
            const respName = DB.usuarios.find(u => u.id === t.responsavelId)?.nome || '--';
            const isAdmin = DB.currentUser.role === 'admin';
            const isOwner = DB.currentUser.id === t.responsavelId;
            const isLate = isOverdue(t.prazoLimite) && !['Baixada', 'Cancelada', 'Reprovada'].includes(t.status);
            const nextActionText = getNextActionText(t);
            const prazoText = getPrazoMicrocopy(t.prazoLimite, t.status);

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
                            <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
                                    <i data-lucide="route" class="w-3 h-3 mr-1"></i> Próximo passo: <strong class="ml-1 text-white">${nextActionText}</strong>
                                </span>
                                <span class="inline-flex items-center px-2.5 py-1 rounded-full ${isLate ? 'bg-red-500/20 text-red-100 border-red-400/30' : 'bg-white/10 text-slate-200 border-white/10'} border">
                                    <i data-lucide="calendar-clock" class="w-3 h-3 mr-1"></i> ${prazoText}
                                </span>
                            </div>
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
                        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <p class="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Mesa de trabalho</p>
                            <h3 class="text-lg font-black text-slate-800">${nextActionText}</h3>
                            <p class="text-sm text-slate-500 mt-2">Esta área mostra apenas as ações permitidas para o papel atual e para o status da ficha.</p>
                            <div class="mt-4 grid grid-cols-2 gap-3">
                                <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <span class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</span>
                                    <span class="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(t.status)}">${t.status}</span>
                                </div>
                                <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <span class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Prazo</span>
                                    <span class="text-xs font-bold ${isLate ? 'text-red-600' : 'text-slate-700'}">${formatDate(t.prazoLimite)}</span>
                                    <p class="text-[10px] ${isLate ? 'text-red-500' : 'text-slate-400'} mt-0.5">${prazoText}</p>
                                </div>
                            </div>
                        </div>
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

        // --- MÁQUINA DE ESTADOS DO WORKFLOW ---
        function executarAcao(id, acao) {
            const t = DB.tarefas.find(x => x.id === id);
            const hoje = new Date().toISOString().split('T')[0];

            if (acao === 'avaliar') {
                const encam = document.getElementById('act-encaminhamento').value;
                if(encam === 'Reprovada' && !window.confirm('Tem certeza que deseja reprovar/cancelar esta ficha?')) return;
                t.avaliacao = { data: hoje, aprovador: DB.currentUser.nome, encaminhamento: encam, observacoes: document.getElementById('act-obs-direcao').value };
                t.status = encam === 'Reprovada' ? 'Reprovada' : 'Aprovada';
                showToast(`Ficha ${encam.toLowerCase()}!`, encam === 'Reprovada' ? 'error' : 'success');
            } 
            else if (acao === 'iniciar') {
                t.status = 'Em execução';
                showToast('Execução iniciada. Bom trabalho!', 'info');
            }
            else if (acao === 'concluir') {
                const res = document.getElementById('act-resumo').value;
                if(!res) { showToast('O relatório de execução é obrigatório.', 'error'); return; }
                t.conclusao = { data: hoje, informante: DB.currentUser.nome, resumo: res, evidencia: document.getElementById('act-evid').checked ? 'Sim' : 'Não' };
                t.status = 'Concluída';
                showToast('Ficha enviada para baixa da direção.', 'success');
            }
            else if (acao === 'baixar') {
                const par = document.getElementById('act-parecer').value;
                if(!par) { showToast('Escreva o parecer final antes de baixar.', 'error'); return; }
                if(!window.confirm('Confirmar baixa final? Depois disso a ficha será considerada encerrada.')) return;
                t.baixa = { data: hoje, responsavel: DB.currentUser.nome, parecer: par };
                t.status = 'Baixada';
                showToast('Ficha encerrada e arquivada com sucesso.', 'success');
            }
            else if (acao === 'reabrir') {
                const par = document.getElementById('act-parecer').value;
                if(!par) { showToast('Justifique a devolução no campo parecer.', 'error'); return; }
                if(!window.confirm('Devolver esta ficha ao executor para correções?')) return;
                t.conclusao = null; // Invalida a conclusão
                t.status = 'Em execução'; // Volta pro técnico
                showToast('Ficha devolvida ao executor para correções.', 'error');
            }

            // Persiste no LocalStorage após qualquer ação
            saveDatabase();
            
            closeModal('modal-detalhes');
            
            // Recarrega a View Atual inteligentemente
            const view = document.querySelector('aside nav button.bg-brand-600').id.replace('nav-', '');
            navigate(view);
            if(view === 'admin') {
                // Se o admin aprovar, a ficha sai da fila de avaliação e vai para execução (some do painel admin)
                // Se o admin der baixa, recarrega a aba de baixas para atualizar
                renderAdminTable(currentAdminTab);
            }
        }

        // --- RECURSO EXTRA: EXPORTAR PARA CSV ---
        function gerarRelatorioCSV() {
            if(DB.tarefas.length === 0) {
                showToast('Não há dados para exportar.', 'info'); return;
            }

            let csvContent = "data:text/csv;charset=utf-8,";
            // Cabeçalho Baseado no Ficha A4 Original
            csvContent += "ID,Data Abertura,Prioridade,Status Atual,Setor Solicitante,Setor Responsável,Executor,Título,Prazo Limite,Aprovador (Sec 4),Entregue Em (Sec 5),Baixado Por (Sec 6)\r\n";

            DB.tarefas.forEach(t => {
                const executor = DB.usuarios.find(u => u.id === t.responsavelId)?.nome || '';
                const aprovador = t.avaliacao ? t.avaliacao.aprovador : '';
                const conclData = t.conclusao ? formatDate(t.conclusao.data) : '';
                const baixador = t.baixa ? t.baixa.responsavel : '';

                // Trata aspas e vírgulas para o CSV
                const clean = (str) => `"${(str||'').toString().replace(/"/g, '""')}"`;

                const row = [
                    t.id, formatDate(t.dataAbertura), t.prioridade, t.status, 
                    clean(t.setorSolicitante), clean(t.setorResponsavel), clean(executor), 
                    clean(t.titulo), formatDate(t.prazoLimite), clean(aprovador), conclData, clean(baixador)
                ].join(",");

                csvContent += row + "\r\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Relatorio_Tatico_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Relatório CSV exportado com sucesso!', 'success');
        }
