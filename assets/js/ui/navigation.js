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
            // Fecha sidebar no mobile ao navegar
            if (window.innerWidth < 1024) toggleSidebar();

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
                'dashboard': { title: 'Visão Geral do Setor Tático', sub: 'Métricas, gráficos e panorama das atividades.' },
                'user-tasks': { title: 'Minhas Execuções', sub: 'Painel de responsabilidade do colaborador.' },
                'admin': { title: 'Mesa de Aprovações e Baixas', sub: 'Área restrita da Direção para governança das tarefas.' }
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
