import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import he from '../locales/he.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

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

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'he', // עברית כברירת מחדל
    fallbackLng: 'he',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
