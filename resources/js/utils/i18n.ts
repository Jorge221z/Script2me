import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Home': 'Home',
      'AI Refactor': 'AI Refactor',
      'Terms and Conditions': 'Terms and Conditions',
      'Repository': 'Repository',
      'Documentation': 'Documentation',
      'Dark': 'Dark',
      'Light': 'Light',
    }
  },
  es: {
    translation: {
      'Home': 'Inicio',
      'AI Refactor': 'Refactorización IA',
      'Terms and Conditions': 'Términos y Condiciones',
      'Repository': 'Repositorio',
      'Documentation': 'Documentación',
      'Dark': 'Oscuro',
      'Light': 'Claro',
    }
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Idioma predeterminado
    fallbackLng: 'es', // Idioma de respaldo
    interpolation: {
      escapeValue: false, // React ya escapa los valores
    },
  });

export default i18n;