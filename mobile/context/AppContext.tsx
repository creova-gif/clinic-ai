import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'patient' | 'chw' | 'clinician' | 'admin' | null;
export type Language = 'sw' | 'en';

export interface UserData {
  name: string;
  phone?: string;
  afyaId?: string;
  language: Language;
  role: UserRole;
}

interface AppContextValue {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isOffline: boolean;
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  logout: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'afyacare_user';

export function AppProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [language, setLanguageState] = useState<Language>('sw');
  const [isOffline, setIsOffline] = useState(false);
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: UserData = JSON.parse(stored);
          setUserDataState(parsed);
          setUserRoleState(parsed.role);
          setLanguageState(parsed.language || 'sw');
        }
      } catch (_) {}
      setIsLoading(false);
    })();
  }, []);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (userData) {
      const updated = { ...userData, role };
      setUserDataState(updated);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (userData) {
      const updated = { ...userData, language: lang };
      setUserDataState(updated);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
    }
  };

  const setUserData = (data: UserData) => {
    setUserDataState(data);
    setUserRoleState(data.role);
    setLanguageState(data.language);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  };

  const logout = () => {
    setUserRoleState(null);
    setUserDataState(null);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  const value = useMemo(() => ({
    userRole, setUserRole, language, setLanguage,
    isOffline, userData, setUserData, logout, isLoading,
  }), [userRole, language, isOffline, userData, isLoading]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
