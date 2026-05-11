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
