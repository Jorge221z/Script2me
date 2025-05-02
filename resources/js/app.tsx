import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-theme';
import { useEffect, useState } from 'react';
import i18n from './utils/i18n';
import { Globe } from 'lucide-react';

import './utils/i18n'; // Importar la configuración de traducción

function LanguageSelector() {
    const [lang, setLang] = useState(i18n.language || 'en');

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setLang(newLang);
        i18n.changeLanguage(newLang);
        // Cambia el idioma en el backend
        await fetch(`/lang/${newLang}`, { method: 'GET', credentials: 'same-origin' });
    };

   
}

createInertiaApp({
    title: (title) => `Script2me - ${title}`,
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        return pages[`./pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000, display: 'flex', alignItems: 'center' }}>
                    {/* Selector de idioma */}
                    <LanguageSelector />
                </div>
                <App {...props} />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Inicializar el tema al cargar la página
initializeTheme();
