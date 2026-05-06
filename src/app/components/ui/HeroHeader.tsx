import React from 'react';
import { motion } from 'motion/react';
import { KangaStripe } from './KangaStripe';

interface HeroHeaderProps {
  greeting?: string;
  name?: string;
  subtitle?: string;
  isOnline?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function HeroHeader({
  greeting,
  name,
  subtitle,
  isOnline = true,
  children,
  className = '',
}: HeroHeaderProps) {
  return (
    <header
      className={`relative ${className}`}
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #f97316 100%)' }}
    >
      <KangaStripe />

      <div className="px-5 pt-4 pb-5">
        {(greeting || name) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          >
            {greeting && (
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {greeting}
              </p>
            )}
            {name && (
              <div className="flex items-center gap-2 mt-0.5">
                <h1
                  className="text-2xl font-black text-white"
                  style={{ fontWeight: 900 }}
                >
                  {name}
                </h1>
                {isOnline !== undefined && (
                  <span
                    aria-live="polite"
                    aria-label={isOnline ? 'Mtandao: unapatikana' : 'Mtandao: haupatikani'}
                    className="w-2.5 h-2.5 rounded-full border-2 border-white flex-shrink-0"
                    style={{ background: isOnline ? '#10b981' : '#ef4444' }}
                  />
                )}
              </div>
            )}
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05, ease: [0.2, 0, 0, 1] }}
            className="mt-4"
          >
            {children}
          </motion.div>
        )}
      </div>

      <KangaStripe />
    </header>
  );
}
