/**
 * ModernHomeRedesigned — AI-first patient home screen
 * Paradigm: intelligent health companion, not a feature menu
 * Inspired by OpenAI app + NALA + Babylon Health
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pill,
  Calendar,
  Activity,
  MapPin,
  AlertTriangle,
  Mic,
  Search,
  Sparkles,
  Video,
  FlaskConical,
  ChevronRight,
  WifiOff,
  Heart,
} from 'lucide-react';
import { HealthScoreRing } from './ui/HealthScoreRing';
import { ConfettiCelebration } from './ui/ConfettiCelebration';
import { useAppStore } from '@/app/store/useAppStore';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────

const T = {
  sw: {
    morning: 'Habari Asubuhi',
    afternoon: 'Habari Mchana',
    evening: 'Habari Jioni',
    aiInsight: 'Shinikizo lako la damu lilikuwa juu wiki iliyopita — hebu tuangalie leo',
    askPlaceholder: 'Uliza swali lako la afya...',
    healthScore: 'Alama ya Afya',
    nextAppt: 'Miadi Ijayo',
    medsDue: 'Dawa Leo',
    noAppt: 'Hakuna miadi',
    taken: 'Imechukuliwa ✓',
    pending: 'Inangoja',
    missed: 'Imekosekana',
    copilotTitle: 'AI yako imegundua...',
    emergency: 'DHARURA',
    symptoms: 'Dalili',
    bookAppt: 'Miadi',
    medications: 'Dawa',
    telemedicine: 'Telemedicine',
    labResults: 'Maabara',
    todaySchedule: 'Ratiba ya Leo',
    healthTip: 'Kidokezo cha Afya',
    offlineBanner: 'Nje ya mtandao — baadhi ya huduma zinapatikana',
    excellent: 'Vizuri Sana',
    good: 'Nzuri',
    fair: 'Wastani',
    scoreUp: 'Imepanda',
  },
  en: {
    morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening',
    aiInsight: 'Your blood pressure was high last week — let\'s check today',
    askPlaceholder: 'Ask your health question...',
    healthScore: 'Health Score',
    nextAppt: 'Next Appointment',
    medsDue: 'Medications Due',
    noAppt: 'No appointments',
    taken: 'Taken ✓',
    pending: 'Pending',
    missed: 'Missed',
    copilotTitle: 'Your AI copilot noticed...',
    emergency: 'EMERGENCY',
    symptoms: 'Symptoms',
    bookAppt: 'Appointment',
    medications: 'Medications',
    telemedicine: 'Telemedicine',
    labResults: 'Lab Results',
    todaySchedule: "Today's Schedule",
    healthTip: 'Health Tip',
    offlineBanner: 'You\'re offline — some features still available',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    scoreUp: 'Up',
  },
} as const;

// ─────────────────────────────────────────────
// Quick actions grid (2×3)
// ─────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    id: 'emergency',
    labelKey: 'emergency' as const,
    Icon: AlertTriangle,
    iconColor: '#ffffff',
    bg: '#dc2626',
    border: '#b91c1c',
    isEmergency: true,
  },
  {
    id: 'symptom-checker',
    labelKey: 'symptoms' as const,
    Icon: Activity,
    iconColor: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    isEmergency: false,
  },
  {
    id: 'appointments',
    labelKey: 'bookAppt' as const,
    Icon: Calendar,
    iconColor: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    isEmergency: false,
  },
  {
    id: 'medications',
    labelKey: 'medications' as const,
    Icon: Pill,
    iconColor: '#0d9488',
    bg: '#f0fdfa',
    border: '#99f6e4',
    isEmergency: false,
  },
  {
    id: 'telemedicine',
    labelKey: 'telemedicine' as const,
    Icon: Video,
    iconColor: '#7c3aed',
    bg: '#faf5ff',
    border: '#ddd6fe',
    isEmergency: false,
  },
  {
    id: 'test-results',
    labelKey: 'labResults' as const,
    Icon: FlaskConical,
    iconColor: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    isEmergency: false,
  },
] as const;

// ─────────────────────────────────────────────
// Community health tips (rotates daily)
// ─────────────────────────────────────────────

const HEALTH_TIPS_EN = [
  'Drink at least 8 glasses of water daily. Staying hydrated supports your kidneys and keeps energy levels up.',
  'Wash hands for 20 seconds before meals — it prevents 80% of common infections.',
  'A 30-minute walk each day reduces heart disease risk by up to 35%.',
  'Sleep 7–9 hours nightly. Poor sleep raises blood pressure and weakens immunity.',
];

const HEALTH_TIPS_SW = [
  'Kunywa maji angalau glasi 8 kwa siku. Kusalia na maji husaidia figo na nguvu zako.',
  'Osha mikono kwa sekunde 20 kabla ya kula — huzuia 80% ya maambukizi ya kawaida.',
  'Tembea dakika 30 kila siku kupunguza hatari ya ugonjwa wa moyo hadi 35%.',
  'Lala masaa 7–9 usiku. Kulala vibaya huongeza shinikizo la damu na kudhoofisha kinga.',
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getGreeting(lang: 'sw' | 'en') {
  const h = new Date().getHours();
  const tr = T[lang];
  if (h < 12) return tr.morning;
  if (h < 17) return tr.afternoon;
  return tr.evening;
}

function getDailyTip(lang: 'sw' | 'en') {
  const tips = lang === 'sw' ? HEALTH_TIPS_SW : HEALTH_TIPS_EN;
  const idx = new Date().getDate() % tips.length;
  return tips[idx];
}

// Stagger animation factory
function stagger(i: number) {
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.28,
      delay: 0.12 + i * 0.055,
      ease: [0.2, 0, 0, 1] as [number, number, number, number],
    },
  };
}

const MED_BORDER: Record<string, string> = {
  taken: 'border-l-[#16a34a]',
  missed: 'border-l-[#dc2626]',
  pending: 'border-l-[#f59e0b]',
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

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
  const { language: ctxLang, isOffline } = useAppStore();
  const lang = (language ?? ctxLang ?? 'sw') as 'sw' | 'en';
  const tr = T[lang];

  const [celebrate, setCelebrate] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Confetti when health score improves
  useEffect(() => {
    if (prevHealthScore !== undefined && healthScore > prevHealthScore) {
      setCelebrate(true);
    }
  }, [healthScore, prevHealthScore]);

  const greeting = getGreeting(lang);
  const dailyTip = getDailyTip(lang);
  const copilotInsight = aiTip ?? tr.aiInsight;

  const medLabel =
    medicationStatus === 'taken'
      ? tr.taken
      : medicationStatus === 'missed'
      ? tr.missed
      : tr.pending;

  return (
    <main
      role="main"
      className="min-h-screen bg-[#f8fafc] pb-24"
    >
      <ConfettiCelebration trigger={celebrate} onDone={() => setCelebrate(false)} />

      {/* ── OFFLINE BANNER ── */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-100 border-b border-amber-200"
            role="alert"
          >
            <WifiOff size={13} aria-hidden="true" />
            {tr.offlineBanner}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────
          DARK NAVY HEADER — AI greeting + input
      ───────────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-4 pt-12 pb-7"
        style={{
          background: 'linear-gradient(160deg, #0f172a 0%, #0f2537 60%, #0d1f30 100%)',
        }}
      >
        {/* Subtle teal orb */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
          aria-hidden="true"
        />

        {/* Greeting row */}
        <motion.div
          className="flex items-start justify-between mb-1"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: 'rgba(94,234,212,0.8)' }}>
              {greeting},
            </p>
            <h1 className="text-2xl font-black text-white leading-tight mt-0.5">
              {userName}
            </h1>
          </div>

          {/* Health score ring — top right */}
          <div className="flex-shrink-0">
            <HealthScoreRing score={healthScore} label={tr.healthScore} />
          </div>
        </motion.div>

        {/* AI insight chip */}
        <motion.div
          className="flex items-start gap-2 mt-3 mb-5 rounded-xl px-3 py-2.5"
          style={{ background: 'rgba(13,148,136,0.18)', border: '1px solid rgba(13,148,136,0.3)' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Sparkles size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#5eead4' }} aria-hidden="true" />
          <p className="text-xs leading-relaxed font-medium" style={{ color: 'rgba(226,232,240,0.9)' }}>
            {copilotInsight}
          </p>
        </motion.div>

        {/* AI input bar */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div
            className="flex items-center gap-3 rounded-2xl px-4 min-h-[52px] transition-all duration-200"
            style={{
              background: inputFocused
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(255,255,255,0.08)',
              border: inputFocused
                ? '1.5px solid rgba(13,148,136,0.7)'
                : '1.5px solid rgba(255,255,255,0.1)',
              boxShadow: inputFocused ? '0 0 0 3px rgba(13,148,136,0.15)' : 'none',
            }}
          >
            <Search size={17} className="flex-shrink-0" style={{ color: 'rgba(148,163,184,0.8)' }} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              placeholder={tr.askPlaceholder}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onClick={() => onNavigate('ai-chat')}
              readOnly
              aria-label={tr.askPlaceholder}
              className="flex-1 bg-transparent text-sm outline-none cursor-pointer focus-visible:ring-0"
              style={{ color: 'rgba(226,232,240,0.85)' }}
            />
            <button
              type="button"
              onClick={() => onNavigate('ai-chat')}
              aria-label="Voice input"
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
              style={{ background: 'rgba(13,148,136,0.3)' }}
            >
              <Mic size={16} style={{ color: '#5eead4' }} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────
          CONTENT AREA
      ───────────────────────────────────────── */}
      <div className="px-4 pt-4 space-y-4">

        {/* ── Health Snapshot Row ── */}
        <motion.div {...stagger(0)}>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {/* Health Score card */}
            <div
              className="flex-shrink-0 w-[140px] rounded-2xl p-3.5 bg-white"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Heart size={12} className="text-[#0d9488]" aria-hidden="true" />
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {tr.healthScore}
                </p>
              </div>
              <p className="text-2xl font-black text-[#0f172a]">{healthScore}</p>
              <p className="text-[10px] font-medium text-[#0d9488] mt-0.5">
                {healthScore >= 80 ? tr.excellent : healthScore >= 60 ? tr.good : tr.fair}
                {prevHealthScore !== undefined && healthScore > prevHealthScore && (
                  <span className="ml-1 text-green-600">↑ {tr.scoreUp}</span>
                )}
              </p>
            </div>

            {/* Next appointment card */}
            <button
              type="button"
              onClick={() => onNavigate('appointments')}
              className="flex-shrink-0 w-[160px] rounded-2xl p-3.5 bg-white text-left min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}
              aria-label={tr.nextAppt}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={12} className="text-[#f59e0b]" aria-hidden="true" />
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {tr.nextAppt}
                </p>
              </div>
              <p className="text-sm font-bold text-[#0f172a] leading-tight">
                {nextAppointment?.date ?? tr.noAppt}
              </p>
              {nextAppointment?.facility && (
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                  {nextAppointment.facility}
                </p>
              )}
            </button>

            {/* Medications due card */}
            <button
              type="button"
              onClick={() => onNavigate('medications')}
              className={`flex-shrink-0 w-[140px] rounded-2xl p-3.5 bg-white text-left min-h-[48px] border-l-4 ${MED_BORDER[medicationStatus]} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]`}
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}
              aria-label={tr.medsDue}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Pill size={12} className="text-[#0d9488]" aria-hidden="true" />
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {tr.medsDue}
                </p>
              </div>
              <p className="text-sm font-bold text-[#0f172a]">{medLabel}</p>
            </button>
          </div>
        </motion.div>

        {/* ── AI Proactive Card ── */}
        <motion.div {...stagger(1)}>
          <div
            className="rounded-2xl p-4 border-l-4 border-l-[#0d9488] bg-white"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            aria-live="polite"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={14} className="text-[#0d9488]" aria-hidden="true" />
              <p className="text-xs font-bold text-[#0d9488]">{tr.copilotTitle}</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{copilotInsight}</p>
            <button
              type="button"
              onClick={() => onNavigate('ai-chat')}
              className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#0d9488] min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] rounded-lg px-1"
            >
              Ask AI <ChevronRight size={13} aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        {/* ── Quick Actions 2×3 grid ── */}
        <motion.div {...stagger(2)}>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action, i) => {
              const { Icon } = action;
              const label = tr[action.labelKey];
              return (
                <motion.button
                  key={action.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate(action.id)}
                  aria-label={label}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-4 px-2 min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] transition-shadow"
                  style={
                    action.isEmergency
                      ? {
                          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                          boxShadow: '0 4px 16px rgba(220,38,38,0.35)',
                        }
                      : {
                          background: action.bg,
                          border: `1px solid ${action.border}`,
                          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        }
                  }
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: action.isEmergency
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: action.iconColor }}
                      aria-hidden="true"
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold text-center leading-tight"
                    style={{ color: action.isEmergency ? '#ffffff' : '#0f172a' }}
                  >
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Today's Schedule ── */}
        {(nextAppointment || medicationStatus !== 'taken') && (
          <motion.div {...stagger(3)}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {tr.todaySchedule}
            </p>
            <div
              className="bg-white rounded-2xl divide-y divide-gray-50"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              {nextAppointment && (
                <button
                  type="button"
                  onClick={() => onNavigate('appointments')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] rounded-t-2xl"
                  aria-label={tr.nextAppt}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-[#f59e0b]" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500">{tr.nextAppt}</p>
                    <p className="text-sm font-bold text-[#0f172a] truncate">
                      {nextAppointment.date}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{nextAppointment.facility}</p>
                  </div>
                  <ChevronRight size={15} className="text-gray-300 flex-shrink-0" aria-hidden="true" />
                </button>
              )}

              {medicationStatus !== 'taken' && (
                <button
                  type="button"
                  onClick={() => onNavigate('medications')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] rounded-b-2xl"
                  aria-label={tr.medsDue}
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Pill size={16} className="text-[#0d9488]" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500">{tr.medsDue}</p>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color:
                          medicationStatus === 'missed' ? '#dc2626' : '#f59e0b',
                      }}
                    >
                      {medLabel}
                    </p>
                  </div>
                  <ChevronRight size={15} className="text-gray-300 flex-shrink-0" aria-hidden="true" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Community Health Tip ── */}
        <motion.div {...stagger(4)}>
          <div
            className="rounded-2xl p-4 bg-white"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Heart size={13} className="text-[#0d9488]" aria-hidden="true" />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {tr.healthTip}
              </p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{dailyTip}</p>
          </div>
        </motion.div>

        {/* ── Always-visible emergency button (bottom sticky) ── */}
        <motion.div {...stagger(5)} className="pt-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('emergency')}
            aria-label={tr.emergency}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-black text-white text-base min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626]"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
            }}
          >
            <AlertTriangle size={20} aria-hidden="true" />
            {tr.emergency}
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}
