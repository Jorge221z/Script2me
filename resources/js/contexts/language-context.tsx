import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../utils/i18n';
import axios from 'axios';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
  isChangingLanguage: boolean;
  languageError: string | null;
  verifyLanguageSync: () => Promise<boolean>;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  changeLanguage: async () => {},
  isChangingLanguage: false,
  languageError: null,
  verifyLanguageSync: async () => true,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

const MAX_RETRIES = 2;
const RETRY_DELAY = 800; // ms

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [languageError, setLanguageError] = useState<string | null>(null);
  
  useEffect(() => {
    // Inicializar el idioma y verificar sincronización al cargar
    const initLanguage = async () => {
      const storedLanguage = localStorage.getItem('userLanguage') || i18n.language;
      
      if (storedLanguage) {
        setCurrentLanguage(storedLanguage);
        i18n.changeLanguage(storedLanguage);
        
        // Verificar que coincida con el backend
        try {
          const serverLanguage = await fetchServerLanguage();
          if (serverLanguage && serverLanguage !== storedLanguage) {
            // Si hay discrepancia, usar el idioma del servidor
            setCurrentLanguage(serverLanguage);
            i18n.changeLanguage(serverLanguage);
            localStorage.setItem('userLanguage', serverLanguage);
          }
        } catch (error) {
          console.warn("Couldn't verify language with server during initialization", error);
        }
      }
    };
    
    initLanguage();
  }, []);
  
  // Función para obtener el idioma actual del servidor
  const fetchServerLanguage = async (): Promise<string> => {
    try {
      const response = await axios.get('/api/current-language', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        }
      });
      
      if (response.data && response.data.locale) {
        return response.data.locale;
      }
      throw new Error('Invalid server response');
    } catch (error) {
      console.error("Error fetching current language from server:", error);
      throw error;
    }
  };
  
  // Función para verificar la sincronización entre frontend y backend
  const verifyLanguageSync = async (): Promise<boolean> => {
    try {
      const serverLanguage = await fetchServerLanguage();
      return serverLanguage === currentLanguage;
    } catch (error) {
      console.error("Error verifying language synchronization:", error);
      return false;
    }
  };
  
  // Función para cambiar el idioma con reintentos
  const changeLanguageWithRetry = async (lang: string, retryCount = 0): Promise<boolean> => {
    try {
      // 1. Hacer la petición al servidor
      const response = await axios.get(`/lang/${lang}`, {
        timeout: 5000, // 5 segundos de timeout
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        }
      });
      
      // 2. Verificar si la respuesta es exitosa
      if (response.status === 200 && response.data.success) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Unknown error changing language');
    } catch (error) {
      console.error(`Error changing language (attempt ${retryCount + 1}):`, error);
      
      // 3. Reintentar si no hemos alcanzado el límite
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return changeLanguageWithRetry(lang, retryCount + 1);
      }
      
      throw error;
    }
  };

  const changeLanguage = async (lang: string) => {
    if (lang === currentLanguage || isChangingLanguage) return;
    
    setIsChangingLanguage(true);
    setLanguageError(null);
    
    try {
      // 1. Actualizar i18n (frontend)
      await i18n.changeLanguage(lang);
      
      // 2. Intentar sincronizar con el backend
      const success = await changeLanguageWithRetry(lang);
      
      if (success) {
        // 3. Si todo va bien, actualizar el estado local y localStorage
        setCurrentLanguage(lang);
        localStorage.setItem('userLanguage', lang);
      } else {
        throw new Error('Failed to change language on server');
      }
    } catch (error) {
      // 4. Si falla, revertir cambios en el frontend
      await i18n.changeLanguage(currentLanguage);
      setLanguageError('Error al cambiar el idioma. Inténtalo de nuevo.');
      console.error('Language change error:', error);
      throw error;
    } finally {
      setIsChangingLanguage(false);
      
      // 5. Verificar sincronización después de un breve retraso
      setTimeout(async () => {
        const isInSync = await verifyLanguageSync();
        if (!isInSync) {
          console.warn('Language synchronization issue detected');
          // Podríamos intentar resolver automáticamente
        }
      }, 1000);
    }
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLanguage, 
        changeLanguage, 
        isChangingLanguage,
        languageError,
        verifyLanguageSync
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
