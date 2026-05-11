// --- BOOTSTRAP DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
            initDatabase();
            lucide.createIcons();
            populateForms();
            updateUIForRole();
            navigate('dashboard');
            
            // Log silencioso confirmando que a variável supabase está ativa
            console.log("Cliente Supabase Inicializado:", supabaseClient);
        });
