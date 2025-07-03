import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language resources
import en from '../locales/en';
import zh from '../locales/zh';

const resources = {
  en,
  zh
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    defaultNS: 'common',
    lng: 'en', // Force default language to English
    
    resources,
    
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'smalltalk_language'
    },
    
    interpolation: {
      escapeValue: false // React already escapes values
    },

    // Handle missing keys in development
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${lng}.${ns}.${key}`);
      }
    }
  });

export default i18n;