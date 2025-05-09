import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../utils/i18n';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  changeLanguage: async () => {},
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    // Inicializar el idioma desde la sesión o localStorage al cargar la app
    const storedLanguage = localStorage.getItem('userLanguage') || i18n.language;
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  const changeLanguage = async (lang: string) => {
    try {
      // Actualizar el estado local
      setCurrentLanguage(lang);
      
      // Actualizar i18n
      await i18n.changeLanguage(lang);
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('userLanguage', lang);
      
      // Sincronizar con el backend
      await fetch(`/lang/${lang}`, { 
        method: 'GET', 
        credentials: 'same-origin',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        }
      });
      
      // Opcional: forzar recarga para asegurar consistencia completa
      // window.location.reload();
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
