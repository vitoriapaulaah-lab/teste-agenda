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
