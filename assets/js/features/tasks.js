// --- LÓGICA CORE: CRIAÇÃO E WORKFLOW ---
        function criarTarefa() {
            // Validação customizada
            const limite = document.getElementById('nt-prazo-limite').value;
            if(!limite) {
                showToast("O prazo limite é obrigatório!", "error");
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
                inicioPrevisto: document.getElementById('nt-inicio-prev').value,
                terminoPrevisto: document.getElementById('nt-termino-prev').value,
                prazoLimite: limite,
                obraVinculada: document.getElementById('nt-obra').value,
                cliente: document.getElementById('nt-cliente').value,
                local: document.getElementById('nt-local').value,
                geraCusto: document.getElementById('nt-gera-custo').value,
                tipoCusto: document.getElementById('nt-tipo-custo').value,
                valorEstimado: document.getElementById('nt-valor').value,
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
