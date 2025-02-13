import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationDE from './locales/de/translation.json';
import translationFR from './locales/fr/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  },
  de: {
    translation: translationDE
  },
  fr: {
    translation: translationFR
  }
};

// Initialize i18next instance
const i18nInstance = i18n.createInstance();

i18nInstance
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferredLanguage',
      caches: ['localStorage']
    },
    react: {
      useSuspense: false
    }
  });

export default i18nInstance;
