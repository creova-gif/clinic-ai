import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          role="status"
          aria-live="polite"
          className="overflow-hidden"
          style={{ background: '#ef4444' }}
        >
          <div className="flex items-center justify-center gap-2 py-2 px-4 text-white text-sm font-semibold">
            <span aria-hidden="true">📶</span>
            Nje ya Mtandao — data yako ipo hapa
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
