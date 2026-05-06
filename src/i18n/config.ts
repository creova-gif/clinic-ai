/**
 * COMPLETE I18N CONFIGURATION
 * AfyaCare Tanzania
 * 
 * Centralized translation system with:
 * - Proper i18n initialization
 * - Language persistence
 * - Fallback handling
 * - Development mode missing key detection
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translations
import swahiliTranslations from './locales/sw.json';
import englishTranslations from './locales/en.json';

// Namespace-specific translations
import chwEn from './locales/en/chw.json';
import chwSw from './locales/sw/chw.json';

// Development mode: log missing keys
const missingKeyHandler = (lngs: readonly string[], ns: string, key: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`🔴 Missing translation key: "${key}" in namespace: "${ns}" for languages: ${lngs.join(', ')}`);
  }
};

// Initialize i18n
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources: {
      sw: {
        translation: swahiliTranslations,
        chw: chwSw,
      },
      en: {
        translation: englishTranslations,
        chw: chwEn,
      }
    },
    
    // Default language
    lng: 'sw', // Swahili is primary for Tanzania
    fallbackLng: 'sw',
    
    // Namespaces
    ns: ['translation', 'chw'],
    defaultNS: 'translation',
    
    // Debug in development
    debug: process.env.NODE_ENV === 'development',
    
    // Missing key handling
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler,
    
    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    // Language detection order
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'afyacare_language',
    },
    
    // React specific
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    }
  });

// Export helper functions
export const changeLanguage = async (lng: 'sw' | 'en') => {
  try {
    await i18n.changeLanguage(lng);
    localStorage.setItem('afyacare_language', lng);
    
    // Trigger custom event for components not using useTranslation
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lng } }));
    
    return true;
  } catch (error) {
    console.error('Failed to change language:', error);
    return false;
  }
};

export const getCurrentLanguage = (): 'sw' | 'en' => {
  return (i18n.language as 'sw' | 'en') || 'sw';
};

export const getStoredLanguage = (): 'sw' | 'en' | null => {
  const stored = localStorage.getItem('afyacare_language');
  return stored === 'en' || stored === 'sw' ? stored : null;
};

// Initialize language from storage on app load
export const initializeLanguage = async () => {
  const stored = getStoredLanguage();
  if (stored && stored !== i18n.language) {
    await changeLanguage(stored);
  }
};

export default i18n;
