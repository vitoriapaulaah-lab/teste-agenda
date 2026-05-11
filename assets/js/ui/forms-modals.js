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
