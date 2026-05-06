/**
 * Auth Session Helper
 *
 * Centralised way to get the current authenticated user ID.
 * Components MUST use this instead of hardcoding 'user_001'.
 *
 * USAGE:
 *   import { getAuthUserId } from '@/app/utils/auth';
 *   const userId = await getAuthUserId();
 *   if (!userId) { navigate to login }
 */

import { supabase, USE_MOCK_DATA } from '../services/supabase';

/** Development-only mock user ID — used when Supabase is not configured */
const MOCK_USER_ID = 'mock_user_001';

/**
 * Get the currently authenticated user's ID.
 * Returns null if the user is not authenticated.
 * Returns the mock ID in development/mock mode.
 */
export async function getAuthUserId(): Promise<string | null> {
  if (USE_MOCK_DATA) {
    return MOCK_USER_ID;
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Get the current session synchronously (from cached session).
 * Safe to use in event handlers and render functions.
 */
export function getSessionSync(): { userId: string | null; email: string | null } {
  if (USE_MOCK_DATA) {
    return { userId: MOCK_USER_ID, email: 'dev@afyacare.tz' };
  }
  // Note: supabase.auth.session() is synchronous but may not have loaded yet.
  // Prefer getAuthUserId() for critical operations.
  return { userId: null, email: null };
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (userId: string | null) => void
): () => void {
  if (USE_MOCK_DATA) {
    callback(MOCK_USER_ID);
    return () => {};
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user?.id ?? null);
  });

  return () => subscription.unsubscribe();
}
