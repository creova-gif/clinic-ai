import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Pill, Calendar, Activity, MapPin, AlertTriangle } from 'lucide-react';
import { HeroHeader } from './ui/HeroHeader';
import { HealthScoreRing } from './ui/HealthScoreRing';
import { ConfettiCelebration } from './ui/ConfettiCelebration';
import { useApp } from '@/app/context/AppContext';

const t = {
  sw: {
    morning: 'Habari Asubuhi', afternoon: 'Habari Mchana', evening: 'Habari Jioni',
    healthScore: 'Alama ya Afya', excellent: 'Vizuri Sana — endelea hivyo ↑',
    good: 'Nzuri — jaribu zaidi', fair: 'Wastani — zingatia afya yako',
    todayMeds: 'Dawa Leo', nextAppt: 'Miadi Ijayo', symptoms: 'Dalili',
    clinics: 'Kliniki', emergency: 'DHARURA', aiTip: 'Kidokezo cha Afya',
    taken: 'Imechukuliwa ✓', pending: 'Inangoja', noAppt: 'Hakuna miadi',
  },
  en: {
    morning: 'Good Morning', afternoon: 'Good Afternoon', evening: 'Good Evening',
    healthScore: 'Health Score', excellent: 'Excellent — keep it up ↑',
    good: 'Good — keep improving', fair: 'Fair — focus on your health',
    todayMeds: "Today's Meds", nextAppt: 'Next Appointment', symptoms: 'Symptoms',
    clinics: 'Clinics', emergency: 'EMERGENCY', aiTip: 'Health Tip',
    taken: 'Taken ✓', pending: 'Pending', noAppt: 'No appointments',
  },
};

interface ModernHomeProps {
  userName?: string;
  language?: 'sw' | 'en';
  onNavigate: (route: string) => void;
  healthScore?: number;
  prevHealthScore?: number;
  nextAppointment?: { date: string; facility: string } | null;
  medicationStatus?: 'taken' | 'pending' | 'missed';
  aiTip?: string;
}

const QUICK_ACTIONS = [
  { id: 'medications',     icon: Pill,      labelKey: 'todayMeds' as const, iconCls: 'text-[#0d9488]', bgCls: 'bg-[#0d94881a]' },
  { id: 'appointments',   icon: Calendar,  labelKey: 'nextAppt' as const,  iconCls: 'text-[#f59e0b]', bgCls: 'bg-[#f59e0b1a]' },
  { id: 'symptom-checker', icon: Activity, labelKey: 'symptoms' as const,  iconCls: 'text-[#16a34a]', bgCls: 'bg-[#16a34a1a]' },
  { id: 'clinic-finder',  icon: MapPin,    labelKey: 'clinics' as const,   iconCls: 'text-[#d97706]', bgCls: 'bg-[#d977061a]' },
];

const MED_BORDER: Record<string, string> = {
  taken:   'border-l-[#16a34a]',
  missed:  'border-l-[#dc2626]',
  pending: 'border-l-[#f59e0b]',
};

function getGreeting(lang: 'sw' | 'en') {
  const h = new Date().getHours();
  if (h < 12) return t[lang].morning;
  if (h < 17) return t[lang].afternoon;
  return t[lang].evening;
}

function scoreLabel(score: number, lang: 'sw' | 'en') {
  if (score >= 80) return t[lang].excellent;
  if (score >= 60) return t[lang].good;
  return t[lang].fair;
}

export function ModernHome({
  userName = 'Amina',
  language,
  onNavigate,
  healthScore = 87,
  prevHealthScore,
  nextAppointment,
  medicationStatus = 'pending',
  aiTip,
}: ModernHomeProps) {
  const { language: ctxLang } = useApp();
  const lang = (language ?? ctxLang ?? 'sw') as 'sw' | 'en';
  const tr = t[lang];

  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (prevHealthScore !== undefined && healthScore > prevHealthScore) {
      setCelebrate(true);
    }
  }, [healthScore, prevHealthScore]);

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, delay: i * 0.05, ease: [0.2, 0, 0, 1] as const },
  });

  return (
    <main role="main" className="min-h-screen bg-[#f8fafc] pb-20">
      <ConfettiCelebration trigger={celebrate} onDone={() => setCelebrate(false)} />

      <HeroHeader
        greeting={getGreeting(lang)}
        name={userName}
        subtitle={scoreLabel(healthScore, lang)}
        isOnline={navigator.onLine}
      >
        <div className="flex justify-center">
          <HealthScoreRing score={healthScore} label={tr.healthScore} />
        </div>
      </HeroHeader>

      <div className="px-4 pt-5 space-y-5">
        {/* Emergency CTA */}
        <motion.button
          type="button"
          {...stagger(0)}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('emergency')}
          aria-label={tr.emergency}
          className="w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 font-black text-white text-base min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626]"
          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
        >
          <AlertTriangle size={20} aria-hidden="true" />
          {tr.emergency}
        </motion.button>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                type="button"
                {...stagger(i + 1)}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate(action.id)}
                aria-label={tr[action.labelKey]}
                className="flex flex-col items-center gap-2 rounded-2xl py-3 px-2 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] min-h-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.bgCls}`}>
                  <Icon size={20} className={action.iconCls} aria-hidden="true" />
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight text-gray-700">
                  {tr[action.labelKey]}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Today's Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            {...stagger(5)}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('medications')}
            aria-label={tr.todayMeds}
            className={`text-left bg-white rounded-2xl p-4 border-l-4 ${MED_BORDER[medicationStatus]} shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]`}
          >
            <Pill size={18} className="text-[#0d9488]" aria-hidden="true" />
            <p className="mt-2 text-xs font-semibold text-gray-500">{tr.todayMeds}</p>
            <p className="text-sm font-bold mt-0.5 text-[#0f172a]">
              {medicationStatus === 'taken' ? tr.taken : tr.pending}
            </p>
          </motion.button>

          <motion.button
            type="button"
            {...stagger(6)}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('appointments')}
            aria-label={tr.nextAppt}
            className="text-left bg-white rounded-2xl p-4 border-l-4 border-l-[#0d9488] shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
          >
            <Calendar size={18} className="text-[#f59e0b]" aria-hidden="true" />
            <p className="mt-2 text-xs font-semibold text-gray-500">{tr.nextAppt}</p>
            <p className="text-sm font-bold mt-0.5 text-[#0f172a]">
              {nextAppointment?.date ?? tr.noAppt}
            </p>
            {nextAppointment?.facility && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{nextAppointment.facility}</p>
            )}
          </motion.button>
        </div>

        {/* AI Health Tip */}
        {aiTip && (
          <motion.div
            {...stagger(7)}
            className="bg-white rounded-2xl p-4 border-l-4 border-l-[#16a34a] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            aria-live="polite"
          >
            <p className="text-xs font-semibold text-[#16a34a]">{tr.aiTip}</p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{aiTip}</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
