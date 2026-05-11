// --- RENDERIZAÇÃO DAS VIEWS ---
        
        function renderDashboardData() {
            document.getElementById('dash-total').innerText = DB.tarefas.length;
            document.getElementById('dash-execucao').innerText = DB.tarefas.filter(t => t.status === 'Em execução').length;
            document.getElementById('dash-pendentes').innerText = DB.tarefas.filter(t => t.status === 'Aberta' || t.status === 'Concluída').length;
            document.getElementById('dash-atraso').innerText = DB.tarefas.filter(t => isOverdue(t.prazoLimite) && t.status !== 'Baixada' && t.status !== 'Cancelada').length;

            const tbody = document.getElementById('dash-table-body');
            tbody.innerHTML = '';
            
            if(DB.tarefas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400">Nenhum dado registrado.</td></tr>`;
            } else {
                DB.tarefas.slice(0, 6).forEach(t => {
                    const respName = DB.usuarios.find(u => u.id === t.responsavelId)?.nome || '--';
                    const isLate = isOverdue(t.prazoLimite) && !['Baixada', 'Cancelada'].includes(t.status);
                    
                    tbody.innerHTML += `
                        <tr class="hover:bg-slate-50 cursor-pointer transition-colors" onclick="abrirDetalhes('${t.id}')">
                            <td class="py-3 px-4 font-bold text-slate-700">${t.id}</td>
                            <td class="py-3 px-4 truncate max-w-[150px] font-medium text-slate-800" title="${t.titulo}">${t.titulo}</td>
                            <td class="py-3 px-4 text-slate-500">${respName}</td>
                            <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(t.status)}">${t.status}</span></td>
                            <td class="py-3 px-4 ${isLate ? 'text-red-600 font-bold flex items-center' : 'text-slate-600'}">
                                ${formatDate(t.prazoLimite)} ${isLate ? '<i data-lucide="alert-triangle" class="w-3 h-3 ml-1"></i>' : ''}
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
            const term = searchObj ? searchObj.value.toLowerCase() : '';

            let myTasks = DB.tarefas.filter(t => t.responsavelId === DB.currentUser.id && !['Baixada', 'Cancelada', 'Reprovada'].includes(t.status));

            if(term) {
                myTasks = myTasks.filter(t => t.titulo.toLowerCase().includes(term) || t.id.toLowerCase().includes(term));
            }

            grid.innerHTML = '';
            if(!myTasks.length) {
                grid.innerHTML = `<div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    <i data-lucide="check-circle-2" class="w-12 h-12 mb-3 text-emerald-400 opacity-50"></i>
                    <p class="font-medium text-slate-500">Sua fila de trabalho está limpa!</p>
                </div>`;
                lucide.createIcons();
                return;
            }

            myTasks.forEach(t => {
                const isLate = isOverdue(t.prazoLimite);
                const borderStatus = isLate ? 'border-red-400 shadow-red-500/10' : 'border-slate-200 hover:border-brand-300';
                
                grid.innerHTML += `
                    <div class="bg-white border-2 ${borderStatus} rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all relative flex flex-col group">
                        ${isLate ? '<div class="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md animate-pulse uppercase tracking-wider">Atrasada</div>' : ''}
                        
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">${t.id}</span>
                            <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(t.status)}">${t.status}</span>
                        </div>
                        
                        <h4 class="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-brand-600 transition-colors">${t.titulo}</h4>
                        <p class="text-sm text-slate-500 line-clamp-2 mb-5 flex-1">${t.descricao}</p>
                        
                        <div class="border-t border-slate-100 pt-4 flex justify-between items-center mt-auto">
                            <div class="flex flex-col">
                                <span class="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Prazo Limite</span>
                                <span class="text-sm font-bold ${isLate ? 'text-red-600' : 'text-slate-700'} flex items-center">
                                    <i data-lucide="calendar" class="w-3 h-3 mr-1 opacity-70"></i> ${formatDate(t.prazoLimite)}
                                </span>
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
            const term = searchObj ? searchObj.value.toLowerCase() : '';

            let list = DB.tarefas;
            if(filterTab === 'avaliacao') list = DB.tarefas.filter(t => t.status === 'Aberta' || t.status === 'Em avaliação');
            if(filterTab === 'baixa') list = DB.tarefas.filter(t => t.status === 'Concluída');

            if(term) list = list.filter(t => t.titulo.toLowerCase().includes(term) || t.id.toLowerCase().includes(term));

            tbody.innerHTML = '';
            if(!list.length) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-12 text-center text-slate-400 bg-slate-50/50"><i data-lucide="check-circle" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>Nenhuma ficha encontrada para esta visão.</td></tr>`;
                lucide.createIcons();
                return;
            }

            list.forEach(t => {
                const respName = DB.usuarios.find(u => u.id === t.responsavelId)?.nome || '--';
                const isLate = isOverdue(t.prazoLimite) && !['Baixada', 'Cancelada'].includes(t.status);
                
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 group">
                        <td class="py-4 px-6">
                            <p class="font-black text-slate-800 text-sm mb-0.5 group-hover:text-brand-600 transition-colors">${t.id}</p>
                            <p class="text-xs text-slate-500 truncate max-w-[250px]" title="${t.titulo}">${t.titulo}</p>
                        </td>
                        <td class="py-4 px-6">
                            <p class="text-xs text-slate-700 font-semibold flex items-center mb-0.5" title="Solicitante"><i data-lucide="arrow-up-right" class="w-3 h-3 mr-1 text-slate-400"></i> ${t.setorSolicitante}</p>
                            <p class="text-xs text-slate-500 flex items-center" title="Executor"><i data-lucide="user" class="w-3 h-3 mr-1 text-brand-400"></i> ${respName}</p>
                        </td>
                        <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(t.status)} shadow-sm">${t.status}</span></td>
                        <td class="py-4 px-6 text-xs">
                            <div class="flex flex-col gap-1">
                                <span class="text-slate-500">Início: <span class="font-medium text-slate-700">${formatDate(t.inicioPrevisto)}</span></span>
                                <span class="${isLate ? 'text-red-600 font-bold bg-red-50 inline-block px-1 rounded' : 'text-slate-500'}">Limite: ${formatDate(t.prazoLimite)}</span>
                            </div>
                        </td>
                        <td class="py-4 px-6 text-right">
                            <button onclick="abrirDetalhes('${t.id}')" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 transition-all shadow-sm">
                                ${filterTab === 'todas' ? 'Visualizar' : 'Analisar Ficha'}
                            </button>
                        </td>
                    </tr>
                `;
            });
            lucide.createIcons();
        }
