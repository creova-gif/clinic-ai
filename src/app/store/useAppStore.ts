import { create } from 'zustand';
import i18n from 'i18next';

export type UserRole = 'patient' | 'chw' | 'clinician' | 'admin' | null;
export type Language = 'sw' | 'en';

interface AppState {
  userRole: UserRole;
  language: Language;
  isOffline: boolean;
  userData: any;
  setUserRole: (role: UserRole) => void;
  setLanguage: (lang: Language) => Promise<void>;
  setIsOffline: (offline: boolean) => void;
  setUserData: (data: any) => void;
  syncLanguageWithI18n: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  userRole: null,
  language: (i18n.language as Language) || 'sw',
  isOffline: false,
  userData: null,
  
  setUserRole: (role) => set({ userRole: role }),
  
  setLanguage: async (lang) => {
    try {
      await i18n.changeLanguage(lang);
      set({ language: lang });
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  },
  
  setIsOffline: (offline) => set({ isOffline: offline }),
  
  setUserData: (data) => set({ userData: data }),
  
  syncLanguageWithI18n: () => {
    const handleLanguageChange = (lng: string) => {
      set({ language: lng as Language });
    };
    i18n.on('languageChanged', handleLanguageChange);
  }
}));
