import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

// Función para obtener el tema inicial
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'; // Cambiado a light

  // Primero intenta obtener desde localStorage
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  if (savedTheme && (savedTheme === 'light' || 'dark')) {
    return savedTheme;
  }

  // Si no hay tema guardado, comprueba la preferencia del sistema
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light'; // Cambiado a light como valor predeterminado
}

// Función para aplicar el tema al DOM
function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  if (theme === 'dark') {
    root.classList.add('dark');
    body.classList.remove('light');
  } else {
    root.classList.remove('dark');
    body.classList.add('light');
  }

  // Disparar un evento personalizado para notificar cambios de tema
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));

  // Guardar en localStorage
  localStorage.setItem('theme', theme);
}

export function useTheme() {
  // Inicializar con light como tema predeterminado
  const [theme, setTheme] = useState<Theme>('light');

  // Detectar cambios en el tema (desde cualquier fuente)
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);

    // Verificar cambios en las clases del documento
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const currentTheme = isDark ? 'dark' : 'light';
      if (currentTheme !== theme) {
        setTheme(currentTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      // Solo cambiar automáticamente si no hay preferencia guardada
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // Escuchar cambios de tema desde otros componentes
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{theme: Theme}>;
      setTheme(customEvent.detail.theme);
    };

    window.addEventListener('themechange', handleThemeChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  // Función para cambiar el tema
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Exponer también isDarkMode para facilitar su uso
  const isDarkMode = theme === 'dark';

  return { theme, isDarkMode, toggleTheme };
}

// Inicializar el tema al cargar la página
export function initializeTheme() {
  if (typeof window === 'undefined') return;

  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);
}
