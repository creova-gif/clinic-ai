/**
 * Custom i18n Hooks and Utilities
 * 
 * Provides enhanced translation capabilities with medical terminology support
 */

import { useTranslation } from 'react-i18next';
import { useMemo, useCallback } from 'react';
import { getMedicalTerm } from './medicalTerms';
import type { Language } from '../store/useAppStore';

/**
 * Enhanced translation hook with medical term support
 * 
 * Usage:
 * ```tsx
 * const { t, tMedical, language, changeLanguage } = useI18n();
 * 
 * // Regular translation
 * const greeting = t('home.greeting', { name: 'John' });
 * 
 * // Medical term (verified)
 * const emergency = tMedical('emergency');
 * ```
 */
export function useI18n() {
  const { t, i18n } = useTranslation();
  const language = (i18n.language || 'sw') as Language;

  // Translate medical terms using verified terminology
  const tMedical = useCallback((termKey: string): string => {
    return getMedicalTerm(termKey, language);
  }, [language]);

  // Change language with proper persistence
  const changeLanguage = useCallback(async (lng: Language) => {
    try {
      await i18n.changeLanguage(lng);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [i18n]);

  // Format date according to language
  const formatDate = useCallback((date: Date | string, format: 'short' | 'long' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options: Intl.DateTimeFormatOptions = format === 'long' 
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
    
    return new Intl.DateTimeFormat(language === 'sw' ? 'sw-TZ' : 'en-US', options).format(dateObj);
  }, [language]);

  // Format time according to language
  const formatTime = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(language === 'sw' ? 'sw-TZ' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }, [language]);

  // Format number according to language
  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat(language === 'sw' ? 'sw-TZ' : 'en-US').format(num);
  }, [language]);

  // Format currency (Tanzania Shilling)
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat(language === 'sw' ? 'sw-TZ' : 'en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  }, [language]);

  // Relative time formatting (e.g., "2 days ago")
  const formatRelativeTime = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return t('dateTime.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('dateTime.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('dateTime.hoursAgo', { count: hours });
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      if (days === 1) return t('dateTime.yesterday');
      return t('dateTime.daysAgo', { count: days });
    } else {
      return formatDate(dateObj);
    }
  }, [t, formatDate, language]);

  return {
    t,
    tMedical,
    language,
    changeLanguage,
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
    isReady: i18n.isInitialized
  };
}

/**
 * Get language direction (for future RTL support)
 */
export function getLanguageDirection(language: Language): 'ltr' | 'rtl' {
  // Currently only LTR languages, but future-proof for Arabic, etc.
  return 'ltr';
}

/**
 * Validate translation key exists
 * Useful during development
 */
export function hasTranslation(key: string, language: Language): boolean {
  // This would check if the key exists in the translation files
  // Implementation would require access to translation resources
  return true; // Simplified for now
}

/**
 * Get all available languages
 */
export function getAvailableLanguages(): Array<{ code: Language; name: string; nativeName: string }> {
  return [
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
    { code: 'en', name: 'English', nativeName: 'English' }
  ];
}

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic Component:
 * ```tsx
 * function MyComponent() {
 *   const { t, language, changeLanguage } = useI18n();
 *   
 *   return (
 *     <div>
 *       <h1>{t('home.greeting', { name: 'User' })}</h1>
 *       <button onClick={() => changeLanguage(language === 'sw' ? 'en' : 'sw')}>
 *         {t('common.changeLanguage')}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * 2. Medical Terms:
 * ```tsx
 * function EmergencyButton() {
 *   const { tMedical } = useI18n();
 *   
 *   return <button>{tMedical('emergency')}</button>;
 * }
 * ```
 * 
 * 3. Date Formatting:
 * ```tsx
 * function AppointmentCard({ date }) {
 *   const { formatDate, formatTime } = useI18n();
 *   
 *   return (
 *     <div>
 *       <p>{formatDate(date, 'long')}</p>
 *       <p>{formatTime(date)}</p>
 *     </div>
 *   );
 * }
 * ```
 */
