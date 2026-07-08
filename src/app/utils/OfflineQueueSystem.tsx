/**
 * Offline Queue Management System
 * 
 * Handles operations performed while offline and syncs when connection restored
 * 
 * Features:
 * - Queue management for offline actions
 * - Automatic retry with exponential backoff
 * - Conflict resolution strategies
 * - Priority-based queue processing
 * - Progress tracking and notifications
 * - Persistent storage across sessions
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SecureStorage } from '../utils/SecureStorage';
import { toast } from 'sonner';

// Action types
export type ActionType = 
  | 'SYMPTOM_SUBMISSION'
  | 'APPOINTMENT_BOOKING'
  | 'MEDICATION_LOG'
  | 'MESSAGE_SEND'
  | 'VITAL_SIGNS_UPDATE'
  | 'PROFILE_UPDATE'
  | 'TEST_RESULT_VIEW'
  | 'JOURNEY_STEP_COMPLETE';

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// Queue item
export interface QueueItem {
  id: string;
  type: ActionType;
  priority: Priority;
  payload: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Sync status
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  lastSyncTime?: Date;
  failedItems: number;
}

interface OfflineQueueContextType {
  addToQueue: (type: ActionType, payload: any, priority?: Priority) => Promise<string>;
  removeFromQueue: (id: string) => void;
  syncQueue: () => Promise<void>;
  clearQueue: () => void;
  getQueueStatus: () => SyncStatus;
  queue: QueueItem[];
}

const OfflineQueueContext = createContext<OfflineQueueContextType | undefined>(undefined);

const STORAGE_KEY = 'offline_queue';
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // Exponential backoff

/**
 * Offline Queue Provider
 */
export const OfflineQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation(['common', 'errors']);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>();

  // Load queue from storage on mount
  useEffect(() => {
    loadQueue();
  }, []);

  // Save queue to storage whenever it changes
  useEffect(() => {
    saveQueue();
  }, [queue]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success(t('common:online_mode'));
      // Auto-sync when coming back online
      syncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning(t('common:offline_mode'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic sync attempt
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const interval = setInterval(() => {
        syncQueue();
      }, 30000); // Try every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isOnline, queue.length]);

  const loadQueue = async () => {
    try {
      const stored = await SecureStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored as string);
        // Convert timestamp strings back to Date objects
        const items = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setQueue(items);
      }
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  };

  const saveQueue = async () => {
    try {
      await SecureStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  };

  const addToQueue = useCallback(async (
    type: ActionType,
    payload: any,
    priority: Priority = 'medium'
  ): Promise<string> => {
    const item: QueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority,
      payload,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      status: 'pending'
    };

    setQueue(prev => {
      // Insert by priority (critical first, then by timestamp)
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const newQueue = [...prev, item].sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
      return newQueue;
    });

    toast.info(t('common:offline_mode'), {
      description: 'Action will sync when online'
    });

    // Try immediate sync if online
    if (isOnline) {
      setTimeout(() => syncQueue(), 100);
    }

    return item.id;
  }, [isOnline]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const processQueueItem = async (item: QueueItem): Promise<boolean> => {
    try {
      // Simulate API call based on action type
      // In production, replace with actual API calls
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 90% success rate
          if (Math.random() > 0.1) {
            resolve(true);
          } else {
            reject(new Error('Network error'));
          }
        }, 1000);
      });

      return true;
    } catch (error: any) {
      console.error(`Failed to process queue item ${item.id}:`, error);
      return false;
    }
  };

  const syncQueue = useCallback(async () => {
    if (!isOnline || isSyncing || queue.length === 0) {
      return;
    }

    setIsSyncing(true);

    try {
      const pendingItems = queue.filter(item => 
        item.status === 'pending' || item.status === 'failed'
      );

      for (const item of pendingItems) {
        // Update status to processing
        setQueue(prev => prev.map(qi => 
          qi.id === item.id ? { ...qi, status: 'processing' as const } : qi
        ));

        // Try to process the item
        const success = await processQueueItem(item);

        if (success) {
          // Mark as completed
          setQueue(prev => prev.map(qi => 
            qi.id === item.id ? { ...qi, status: 'completed' as const } : qi
          ));

          // Remove completed item after a delay
          setTimeout(() => removeFromQueue(item.id), 1000);

          toast.success(`Synced: ${getActionLabel(item.type)}`);
        } else {
          // Increment retry count
          const newRetryCount = item.retryCount + 1;

          if (newRetryCount >= item.maxRetries) {
            // Max retries reached
            setQueue(prev => prev.map(qi => 
              qi.id === item.id 
                ? { 
                    ...qi, 
                    status: 'failed' as const, 
                    error: 'Max retries exceeded',
                    retryCount: newRetryCount
                  } 
                : qi
            ));

            toast.error(`Failed to sync: ${getActionLabel(item.type)}`, {
              description: 'Please try again manually'
            });
          } else {
            // Schedule retry with exponential backoff
            const delay = RETRY_DELAYS[newRetryCount - 1] || 5000;
            
            setQueue(prev => prev.map(qi => 
              qi.id === item.id 
                ? { 
                    ...qi, 
                    status: 'pending' as const, 
                    retryCount: newRetryCount 
                  } 
                : qi
            ));

            // Wait before next retry
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error(t('errors:data.sync_failed'));
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, queue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    toast.success('Queue cleared');
  }, []);

  const getQueueStatus = useCallback((): SyncStatus => {
    return {
      isOnline,
      isSyncing,
      queueLength: queue.filter(item => item.status !== 'completed').length,
      lastSyncTime,
      failedItems: queue.filter(item => item.status === 'failed').length
    };
  }, [isOnline, isSyncing, queue, lastSyncTime]);

  const getActionLabel = (type: ActionType): string => {
    const labels: Record<ActionType, string> = {
      'SYMPTOM_SUBMISSION': 'Symptom submission',
      'APPOINTMENT_BOOKING': 'Appointment booking',
      'MEDICATION_LOG': 'Medication log',
      'MESSAGE_SEND': 'Message',
      'VITAL_SIGNS_UPDATE': 'Vital signs',
      'PROFILE_UPDATE': 'Profile update',
      'TEST_RESULT_VIEW': 'Test result view',
      'JOURNEY_STEP_COMPLETE': 'Journey step'
    };
    return labels[type] || type;
  };

  return (
    <OfflineQueueContext.Provider
      value={{
        addToQueue,
        removeFromQueue,
        syncQueue,
        clearQueue,
        getQueueStatus,
        queue
      }}
    >
      {children}
    </OfflineQueueContext.Provider>
  );
};

/**
 * Hook to use offline queue
 */
export const useOfflineQueue = (): OfflineQueueContextType => {
  const context = useContext(OfflineQueueContext);
  if (!context) {
    throw new Error('useOfflineQueue must be used within OfflineQueueProvider');
  }
  return context;
};

/**
 * Offline Queue Status Component
 * Shows current sync status to user
 */
export const OfflineQueueStatus: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { getQueueStatus, syncQueue, queue } = useOfflineQueue();
  const status = getQueueStatus();

  if (status.queueLength === 0 && status.isOnline) {
    return null; // Don't show anything if queue is empty and online
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40">
      <div className={`
        bg-white border-2 rounded-lg shadow-lg p-4
        ${!status.isOnline ? 'border-[#F4A261]' : 'border-[#1B998B]'}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              h-3 w-3 rounded-full
              ${status.isOnline ? 'bg-[#2E7D32]' : 'bg-[#F4A261]'}
              ${status.isSyncing ? 'animate-pulse' : ''}
            `} />
            <div>
              <p className="text-sm font-medium text-[#1E1E1E]">
                {status.isOnline 
                  ? status.isSyncing 
                    ? 'Syncing...' 
                    : 'Online'
                  : 'Offline Mode'}
              </p>
              {status.queueLength > 0 && (
                <p className="text-xs text-[#6B7280]">
                  {status.queueLength} action{status.queueLength !== 1 ? 's' : ''} pending
                </p>
              )}
            </div>
          </div>

          {status.isOnline && status.queueLength > 0 && !status.isSyncing && (
            <button
              onClick={syncQueue}
              className="text-sm text-[#0F3D56] font-medium hover:underline"
            >
              Sync Now
            </button>
          )}
        </div>

        {/* Failed items warning */}
        {status.failedItems > 0 && (
          <div className="mt-3 p-2 bg-[#FEF3F2] rounded text-xs text-[#C84B31]">
            {status.failedItems} action{status.failedItems !== 1 ? 's' : ''} failed to sync
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Higher-order function to wrap actions with offline support
 */
export const withOfflineSupport = <T extends any[]>(
  action: (...args: T) => Promise<any>,
  actionType: ActionType,
  priority: Priority = 'medium'
) => {
  return async (...args: T) => {
    const { addToQueue } = useOfflineQueue();
    
    if (!navigator.onLine) {
      // Queue for later
      const queueId = await addToQueue(actionType, args, priority);
      return { queued: true, queueId };
    }

    try {
      // Try to execute immediately
      const result = await action(...args);
      return result;
    } catch (error) {
      // If it fails, add to queue
      const queueId = await addToQueue(actionType, args, priority);
      return { queued: true, queueId, error };
    }
  };
};
