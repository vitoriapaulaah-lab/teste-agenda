// --- MÁQUINA DE ESTADOS DO WORKFLOW ---
        function executarAcao(id, acao) {
            const t = DB.tarefas.find(x => x.id === id);
            const hoje = new Date().toISOString().split('T')[0];

            if (acao === 'avaliar') {
                const encam = document.getElementById('act-encaminhamento').value;
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
                t.baixa = { data: hoje, responsavel: DB.currentUser.nome, parecer: par };
                t.status = 'Baixada';
                showToast('Ficha encerrada e arquivada com sucesso.', 'success');
            }
            else if (acao === 'reabrir') {
                const par = document.getElementById('act-parecer').value;
                if(!par) { showToast('Justifique a devolução no campo parecer.', 'error'); return; }
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
