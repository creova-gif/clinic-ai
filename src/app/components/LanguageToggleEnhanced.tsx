/**
 * ENHANCED LANGUAGE TOGGLE
 * AfyaCare Tanzania
 * 
 * Properly integrated language switcher with:
 * - i18next integration
 * - Persistent storage
 * - Force re-render on change
 * - Visual feedback
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { changeLanguage } from '@/i18n/config';

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  const currentLanguage = i18n.language as 'sw' | 'en';

  const handleLanguageChange = async (lng: 'sw' | 'en') => {
    if (lng === currentLanguage) {
      setShowMenu(false);
      return;
    }

    setSwitching(true);
    
    try {
      // Change language using centralized function
      await changeLanguage(lng);
      
      // Close menu after brief delay
      setTimeout(() => {
        setShowMenu(false);
        setSwitching(false);
      }, 300);
    } catch (error) {
      setSwitching(false);
    }
  };

  const languages = [
    { code: 'sw' as const, name: 'Kiswahili', flag: '🇹🇿' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' }
  ];

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 transition-colors"
        aria-label={t('common.selectLanguage', 'Select Language')}
        disabled={switching}
      >
        <Globe className={`w-5 h-5 text-gray-600 ${switching ? 'animate-spin' : ''}`} />
        <span className="font-semibold text-gray-800">
          {currentLanguage === 'sw' ? 'KiSwahili' : 'English'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden">
            {languages.map((lang) => {
              const isActive = currentLanguage === lang.code;
              
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={switching}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className={`font-semibold ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                      {lang.name}
                    </span>
                  </div>
                  
                  {isActive && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              );
            })}

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                {currentLanguage === 'sw' 
                  ? 'Lugha inatumika kwenye programu yote'
                  : 'Language applies to entire app'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * COMPACT VERSION (for navigation bars)
 */
export function LanguageToggleCompact() {
  const { i18n } = useTranslation();
  const [switching, setSwitching] = useState(false);

  const currentLanguage = i18n.language as 'sw' | 'en';

  const handleToggle = async () => {
    const newLang = currentLanguage === 'sw' ? 'en' : 'sw';
    
    setSwitching(true);
    await changeLanguage(newLang);
    setSwitching(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={switching}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all ${
        switching ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      aria-label="Toggle Language"
    >
      {switching ? (
        <Globe className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <span className="text-sm font-bold">
            {currentLanguage === 'sw' ? '🇹🇿 SW' : '🇬🇧 EN'}
          </span>
        </>
      )}
    </button>
  );
}

export default LanguageToggle;
