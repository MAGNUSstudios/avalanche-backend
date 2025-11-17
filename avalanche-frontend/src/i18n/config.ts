import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';

const resources = {
  en: {
    translation: enTranslations
  },
  es: {
    translation: esTranslations
  },
  fr: {
    translation: frTranslations
  },
  de: {
    translation: deTranslations
  }
};

// Get language from localStorage, default to 'en'
const savedLanguage = localStorage.getItem('avalanche_language');

// Debug logging
console.log('Reading from localStorage:', {
  avalanche_language: savedLanguage,
  allKeys: Object.keys(localStorage),
  allStorage: {...localStorage}
});

const languageToUse = savedLanguage || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: languageToUse, // Set initial language from localStorage
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false // Prevent suspense issues
    }
  });

// Log for debugging
console.log('i18n initialized with language:', languageToUse);

export default i18n;
