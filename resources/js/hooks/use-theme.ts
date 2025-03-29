import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

// Función para obtener el tema inicial
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  // Primero intenta obtener desde localStorage
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  if (savedTheme && (savedTheme === 'light' || 'dark')) {
    return savedTheme;
  }

  // Si no hay tema guardado, comprueba la preferencia del sistema
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
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

  // Guardar en localStorage
  localStorage.setItem('theme', theme);
}

export function useTheme() {
  // No inicializar el estado directamente con getInitialTheme para SSR
  const [theme, setTheme] = useState<Theme>('light');

  // Inicializar el tema en el primer render del cliente
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Función para cambiar el tema
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme };
}

// Inicializar el tema al cargar la página
export function initializeTheme() {
  if (typeof window === 'undefined') return;

  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);
}
