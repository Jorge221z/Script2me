import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-theme';
import './utils/i18n'; // Importar la configuración de traducción
import { LanguageProvider } from './contexts/language-context';

createInertiaApp({
    title: (title) => `Script2me - ${title}`,
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        return pages[`./pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <LanguageProvider>
                <App {...props} />
            </LanguageProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Inicializar el tema al cargar la página
initializeTheme();
