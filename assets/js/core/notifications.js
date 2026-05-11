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
