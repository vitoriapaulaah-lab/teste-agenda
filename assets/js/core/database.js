// --- INICIALIZAÇÃO DO SISTEMA ---
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
