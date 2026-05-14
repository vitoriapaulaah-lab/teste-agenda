// Configuração do Tailwind CDN.
// Mantém a paleta personalizada do projeto sem quebrar caso o CDN ainda esteja inicializando.
window.tailwind = window.tailwind || {};
window.tailwind.config = {
    theme: {
        extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'] },
            colors: {
                brand: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#2563eb',
                    600: '#1d4ed8',
                    700: '#1e40af',
                    800: '#1e3a8a',
                    900: '#172554'
                },
                sidebar: '#111827'
            }
        }
    }
};
