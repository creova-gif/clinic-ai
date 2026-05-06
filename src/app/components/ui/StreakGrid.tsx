import React from 'react';
import { motion } from 'motion/react';

interface StreakGridProps {
  completedDays: number;
  totalDays?: number;
  className?: string;
}

export function StreakGrid({ completedDays, totalDays = 7, className = '' }: StreakGridProps) {
  const days = ['J', 'T', 'W', 'A', 'K', 'S', 'J'];

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      aria-label={`Siku ${completedDays} kati ya ${totalDays} umefanikiwa`}
    >
      {Array.from({ length: totalDays }, (_, i) => {
        const done = i < completedDays;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: done ? '#10b981' : '#f1f5f9',
                color: done ? '#ffffff' : '#9ca3af',
                border: done ? 'none' : '2px solid #e2e8f0',
              }}
              aria-hidden="true"
            >
              {done ? '✓' : days[i]}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
