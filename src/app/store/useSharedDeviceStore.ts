import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

const getDeviceFingerprint = (): string => {
  if (typeof window === 'undefined') return 'server';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  
  return btoa(
    JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvasFingerprint: canvas.toDataURL(),
    })
  );
};

export interface ActivityLogEntry {
  timestamp: string;
  action: string;
  details?: string;
  deviceFingerprint: string;
}

interface SharedDeviceState {
  isSharedDevice: boolean;
  isSessionLocked: boolean;
  sessionTimeRemaining: number;
  requireAuth: boolean;
  activityLog: ActivityLogEntry[];
  lastActivityTime: number;
  showWarning: boolean;
  deviceFingerprint: string | null;
  
  // Actions
  setDeviceMode: (mode: 'personal' | 'shared') => void;
  resetSessionTimer: (autoLockTimeoutMs?: number) => void;
  lockSession: () => void;
  unlockSession: (pin?: string) => boolean;
  logActivity: (action: string, details?: string) => void;
  updateSessionTimeRemaining: (remaining: number) => void;
  setShowWarning: (show: boolean) => void;
  initializeDeviceChecks: () => void;
}

export const useSharedDeviceStore = create<SharedDeviceState>()(
  persist(
    (set, get) => ({
      isSharedDevice: false,
      isSessionLocked: false,
      sessionTimeRemaining: 120000,
      requireAuth: false,
      activityLog: [],
      lastActivityTime: Date.now(),
      showWarning: false,
      deviceFingerprint: null,

      initializeDeviceChecks: () => {
        const currentFingerprint = getDeviceFingerprint();
        const storedFingerprint = get().deviceFingerprint;

        // If fingerprint changed significantly, default to shared for safety
        if (storedFingerprint && storedFingerprint !== currentFingerprint) {
          set({ isSharedDevice: true, requireAuth: true, deviceFingerprint: currentFingerprint });
          get().logActivity('DEVICE_MODE_CHANGED', 'Set to SHARED automatically (fingerprint mismatch)');
        } else if (!storedFingerprint) {
          set({ deviceFingerprint: currentFingerprint });
        }
      },

      setDeviceMode: (mode) => {
        const isShared = mode === 'shared';
        set({ isSharedDevice: isShared, requireAuth: isShared });
        get().logActivity('DEVICE_MODE_CHANGED', `Set to ${isShared ? 'SHARED' : 'PERSONAL'}`);
      },
      
      logActivity: (action, details) => {
        const entry: ActivityLogEntry = {
          timestamp: new Date().toISOString(),
          action,
          details,
          deviceFingerprint: getDeviceFingerprint(),
        };
        set((state) => ({
          activityLog: [entry, ...state.activityLog].slice(0, 100)
        }));
      },

      resetSessionTimer: (autoLockTimeoutMs = 120000) => {
        set({
          lastActivityTime: Date.now(),
          sessionTimeRemaining: autoLockTimeoutMs,
          showWarning: false
        });
      },

      lockSession: () => {
        set({ isSessionLocked: true });
        get().logActivity('SESSION_LOCKED', 'Auto-lock due to inactivity');
      },

      unlockSession: (pin) => {
        const storedPin = localStorage.getItem('device_pin');
        if (storedPin && pin !== storedPin) {
          get().logActivity('UNLOCK_FAILED', 'Incorrect PIN');
          return false;
        }
        
        set({ isSessionLocked: false });
        get().resetSessionTimer();
        get().logActivity('SESSION_UNLOCKED', pin ? 'PIN authentication' : 'No auth required');
        return true;
      },
      
      updateSessionTimeRemaining: (remaining) => set({ sessionTimeRemaining: remaining }),
      setShowWarning: (show) => set({ showWarning: show })
    }),
    {
      name: 'shared-device-storage',
      partialize: (state) => ({
        isSharedDevice: state.isSharedDevice,
        requireAuth: state.requireAuth,
        activityLog: state.activityLog,
        deviceFingerprint: state.deviceFingerprint
      })
    }
  )
);

export function useSharedDeviceEffects(autoLockTimeoutMs = 120000, warningTimeMs = 30000) {
  const isSharedDevice = useSharedDeviceStore(state => state.isSharedDevice);
  const isSessionLocked = useSharedDeviceStore(state => state.isSessionLocked);
  const lastActivityTime = useSharedDeviceStore(state => state.lastActivityTime);
  const resetSessionTimer = useSharedDeviceStore(state => state.resetSessionTimer);
  const lockSession = useSharedDeviceStore(state => state.lockSession);
  const updateSessionTimeRemaining = useSharedDeviceStore(state => state.updateSessionTimeRemaining);
  const setShowWarning = useSharedDeviceStore(state => state.setShowWarning);
  const initializeDeviceChecks = useSharedDeviceStore(state => state.initializeDeviceChecks);

  useEffect(() => {
    initializeDeviceChecks();
  }, [initializeDeviceChecks]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetSessionTimer(autoLockTimeoutMs);

    events.forEach(event => window.addEventListener(event, handleActivity));
    return () => events.forEach(event => window.removeEventListener(event, handleActivity));
  }, [resetSessionTimer, autoLockTimeoutMs]);

  useEffect(() => {
    if (!isSharedDevice || isSessionLocked) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityTime;
      const remaining = autoLockTimeoutMs - elapsed;

      updateSessionTimeRemaining(remaining);

      if (remaining <= warningTimeMs && remaining > 0) {
        setShowWarning(true);
      }

      if (remaining <= 0) {
        lockSession();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSharedDevice, isSessionLocked, lastActivityTime, autoLockTimeoutMs, warningTimeMs, lockSession, updateSessionTimeRemaining, setShowWarning]);
}
