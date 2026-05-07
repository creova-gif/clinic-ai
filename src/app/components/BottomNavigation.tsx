import React from 'react';
import { Home, Pill, Calendar, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '@/app/context/AppContext';

const translations = {
  sw: { home: 'Nyumbani', medications: 'Dawa', ai: 'AI', appointments: 'Miadi', profile: 'Mimi' },
  en: { home: 'Home', medications: 'Meds', ai: 'AI', appointments: 'Visits', profile: 'Me' },
};

interface BottomNavigationProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

const LEFT_TABS = [
  { id: 'dashboard',   icon: Home,     labelKey: 'home'        as const },
  { id: 'medications', icon: Pill,     labelKey: 'medications' as const },
];

const RIGHT_TABS = [
  { id: 'appointments', icon: Calendar, labelKey: 'appointments' as const },
  { id: 'profile',      icon: User,     labelKey: 'profile'      as const },
];

export function BottomNavigation({ activeRoute, onNavigate }: BottomNavigationProps) {
  const { language } = useApp();
  const t = translations[language as keyof typeof translations] ?? translations.sw;
  const isAIActive = activeRoute === 'ai-chat';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Urambazaji wa chini"
    >
      <div className="flex items-end h-16">
        {/* Left tabs */}
        {LEFT_TABS.map((item) => {
          const isActive = activeRoute === item.id || activeRoute.startsWith(item.id + '/');
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-label={t[item.labelKey]}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 relative flex flex-col items-center justify-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] focus-visible:ring-inset min-h-[48px] h-16"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-2 top-1 bottom-1 rounded-xl bg-[#ccfbf1]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative z-10"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-[#0d9488]' : 'text-gray-400'}
                  aria-hidden="true"
                />
              </motion.div>
              {isActive && (
                <span className="relative z-10 text-[10px] font-semibold text-[#0d9488]">
                  {t[item.labelKey]}
                </span>
              )}
            </button>
          );
        })}

        {/* Center AI tab — elevated */}
        <div className="flex-1 flex flex-col items-center justify-end pb-3 relative">
          <motion.button
            type="button"
            onClick={() => onNavigate('ai-chat')}
            aria-label={t.ai}
            aria-current={isAIActive ? 'page' : undefined}
            whileTap={{ scale: 0.93 }}
            className="relative flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] focus-visible:ring-offset-2 rounded-2xl"
          >
            <motion.div
              animate={isAIActive ? { y: -4 } : { y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(13,148,136,0.4)]"
              style={{
                background: isAIActive
                  ? 'linear-gradient(135deg, #0d9488, #0f766e)'
                  : 'linear-gradient(135deg, #0d9488, #0f766e)',
              }}
            >
              <Sparkles size={24} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-bold text-[#0d9488] mt-1">{t.ai}</span>
          </motion.button>
        </div>

        {/* Right tabs */}
        {RIGHT_TABS.map((item) => {
          const isActive = activeRoute === item.id || activeRoute.startsWith(item.id + '/');
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-label={t[item.labelKey]}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 relative flex flex-col items-center justify-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] focus-visible:ring-inset min-h-[48px] h-16"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-2 top-1 bottom-1 rounded-xl bg-[#ccfbf1]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative z-10"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-[#0d9488]' : 'text-gray-400'}
                  aria-hidden="true"
                />
              </motion.div>
              {isActive && (
                <span className="relative z-10 text-[10px] font-semibold text-[#0d9488]">
                  {t[item.labelKey]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
