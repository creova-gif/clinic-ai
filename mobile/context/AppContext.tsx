import { View, Text, Pressable } from 'react-native';
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { createSecureStorage } from '../secure-storage';

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
  /** Wipes all on-device data. Rejects if the wipe was incomplete; callers must tell the user. */
  logout: () => Promise<void>;
  isLoading: boolean;
  /** True when saved data could not be read (saves are blocked) or a save failed. */
  storageError: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const LEGACY_STORAGE_KEY = 'afyacare_user';
// Health profile is sensitive personal data: stored via secure-storage
// (SecureStore / AES-GCM), never plaintext AsyncStorage. The legacy plaintext
// copy is migrated, verified and deleted on first launch (mobile audit 2026-10-09).
const storage = createSecureStorage({ namespace: 'afyacare', legacyKeys: { user: LEGACY_STORAGE_KEY } });

export function AppProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [language, setLanguageState] = useState<Language>('sw');
  const [isOffline, setIsOffline] = useState(false);
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    (async () => {
      setLoadError(false);
      try {
        const stored = await storage.get('user');
        if (stored) {
          const parsed: UserData = JSON.parse(stored);
          setUserDataState(parsed);
          setUserRoleState(parsed.role);
          setLanguageState(parsed.language || 'sw');
        }
      } catch (_) {
        // Fail closed: do not fall through to onboarding, which would save a
        // new profile over the real (unreadable) one.
        setLoadError(true);
        return;
      }
      setIsLoading(false);
    })();
  }, [loadAttempt]);

  // Saves are blocked after a failed load; failures surface via storageError.
  const persist = (data: UserData) => {
    if (loadError || isLoading) return;
    storage.set('user', JSON.stringify(data)).then(() => setSaveError(false), () => setSaveError(true));
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (userData) {
      const updated = { ...userData, role };
      setUserDataState(updated);
      persist(updated);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (userData) {
      const updated = { ...userData, language: lang };
      setUserDataState(updated);
      persist(updated);
    }
  };

  const setUserData = (data: UserData) => {
    setUserDataState(data);
    setUserRoleState(data.role);
    setLanguageState(data.language);
    persist(data);
  };

  const logout = async () => {
    // Serialised with pending saves inside secure-storage; errors propagate.
    await storage.wipe();
    setUserRoleState(null);
    setUserDataState(null);
  };

  const value = useMemo(() => ({
    userRole, setUserRole, language, setLanguage,
    isOffline, userData, setUserData, logout, isLoading,
    storageError: loadError || saveError,
  }), [userRole, language, isOffline, userData, isLoading, loadError, saveError]);

  if (loadError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 16 }}>
          Hatukuweza kufungua taarifa zako zilizohifadhiwa. Hakuna kilichobadilishwa au kufutwa.
          {'\n\n'}We couldn't open your saved information. Nothing has been changed or deleted.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => setLoadAttempt(a => a + 1)} style={{ padding: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Jaribu tena / Try again</Text>
        </Pressable>
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
