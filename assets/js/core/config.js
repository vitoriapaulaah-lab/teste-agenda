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
