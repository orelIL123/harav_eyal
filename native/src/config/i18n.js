import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations with error handling
let he, en, fr;
try {
  he = require('../locales/he.json');
} catch (error) {
  console.error('Error loading Hebrew translations:', error);
  he = {};
}

try {
  en = require('../locales/en.json');
} catch (error) {
  console.error('Error loading English translations:', error);
  en = {};
}

try {
  fr = require('../locales/fr.json');
} catch (error) {
  console.error('Error loading French translations:', error);
  fr = {};
}

const resources = {
  he: {
    translation: he,
  },
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

// Initialize i18n with error handling
try {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'he', // עברית כברירת מחדל
      fallbackLng: 'he',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v3', // For React Native compatibility
    });
} catch (error) {
  console.error('Error initializing i18n:', error);
  // Initialize with empty resources as fallback
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        he: { translation: {} },
        en: { translation: {} },
        fr: { translation: {} },
      },
      lng: 'he',
      fallbackLng: 'he',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v3',
    });
}

export default i18n;
