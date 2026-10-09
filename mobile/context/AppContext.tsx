import { View } from 'react-native';
import { router } from 'expo-router';
import { StorageErrorScreen, SaveErrorBanner } from '../components/StorageErrorScreen';
import { createStatePersistence } from './statePersistence';
import { errorCode, STATE_UNREADABLE } from './storageRecovery';
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
// A failed load blocks all saves (they set saveError instead of being dropped).
const persistence = createStatePersistence(storage, 'user');

export function AppProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [language, setLanguageState] = useState<Language>('sw');
  const [isOffline, setIsOffline] = useState(false);
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [goOnboarding, setGoOnboarding] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    (async () => {
      setLoadError(null);
      let stored: string | null;
      try {
        stored = await persistence.load();
      } catch (e) {
        // Fail closed: do not fall through to onboarding, which would save a
        // new profile over the real (unreadable) one.
        setLoadError(errorCode(e));
        return;
      }
      if (stored) {
        let parsed: UserData;
        try {
          parsed = JSON.parse(stored);
        } catch {
          setLoadError(STATE_UNREADABLE);
          return;
        }
        setUserDataState(parsed);
        setUserRoleState(parsed.role);
        setLanguageState(parsed.language || 'sw');
      }
      setIsLoading(false);
    })();
  }, [loadAttempt]);

  // After a confirmed reset, go to onboarding once the navigator is mounted.
  useEffect(() => {
    if (!goOnboarding) return;
    setGoOnboarding(false);
    const t = setTimeout(() => { try { router.replace('/onboarding'); } catch { /* index route redirects anyway */ } }, 0);
    return () => clearTimeout(t);
  }, [goOnboarding]);

  // Saves blocked by a failed/pending load, or failing, set saveError (never dropped silently).
  const persist = (data: UserData) => {
    persistence.save(JSON.stringify(data)).then(() => setSaveError(false), () => setSaveError(true));
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
    await persistence.clear();
    setUserRoleState(null);
    setUserDataState(null);
  };

  const value = useMemo(() => ({
    userRole, setUserRole, language, setLanguage,
    isOffline, userData, setUserData, logout, isLoading,
    storageError: loadError !== null || saveError,
  }), [userRole, language, isOffline, userData, isLoading, loadError, saveError]);

  if (loadError) {
    return (
      <StorageErrorScreen
        code={loadError}
        onRetry={() => setLoadAttempt(a => a + 1)}
        onReset={async () => {
          // User confirmed permanent deletion: wipe, then onboarding.
          try {
            await persistence.clear(); // storage.wipe() + re-enable saves
          } catch (e) {
            setLoadError(errorCode(e));
            throw e;
          }
          setUserRoleState(null);
          setUserDataState(null);
          setLoadError(null);
          setIsLoading(false);
          setGoOnboarding(true);
        }}
      />
    );
  }

  return (
    <AppContext.Provider value={value}>
      {saveError ? (
        <View style={{ flex: 1 }}>
          <SaveErrorBanner />
          {children}
        </View>
      ) : children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
