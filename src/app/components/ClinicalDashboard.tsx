import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Clock, AlertTriangle, CheckCircle2, Search,
  ChevronRight, Pill, FileText, ClipboardList, Sparkles,
  ChevronDown, ChevronUp, LogOut, Bell, X, User,
} from 'lucide-react';

interface ClinicalDashboardProps {
  language: 'sw' | 'en';
  onLogout: () => void;
  providerName: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  afyaId: string;
  complaint: { sw: string; en: string };
  arrivalTime: string;
  waitMin: number;
  priority: 'routine' | 'urgent' | 'emergency';
  aiRisk: number;
  vitals?: { temp: number; bp: string; hr: number };
  intakeDone: boolean;
}

type ChartTab = 'summary' | 'history' | 'admin';

const PRIORITY_META = {
  emergency: { label: { sw: 'Dharura',     en: 'Emergency' }, color: '#dc2626', bg: '#fee2e2' },
  urgent:    { label: { sw: 'Haraka',      en: 'Urgent'    }, color: '#d97706', bg: '#fef3c7' },
  routine:   { label: { sw: 'Kawaida',     en: 'Routine'   }, color: '#0d9488', bg: '#ccfbf1' },
};

const RX_TEMPLATES = [
  { id: 'malaria',  label: 'Malaria',     drugs: 'AL 80/480mg × 6 tabs (3 days)' },
  { id: 'urti',    label: 'URTI',         drugs: 'Amoxicillin 500mg TDS × 5d + Paracetamol 1g PRN' },
  { id: 'anc',     label: 'ANC',          drugs: 'FeSO4 200mg BD + Folic acid 5mg OD' },
  { id: 'child',   label: 'Child < 5y',   drugs: 'Amoxicillin susp 250mg/5ml TDS × 5d' },
  { id: 'refill',  label: 'Refill →',     drugs: '' },
];

const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P001', name: 'Amina Hassan',      age: 32, gender: 'F', afyaId: 'AFY-103241',
    complaint: { sw: 'Homa na maumivu ya kichwa', en: 'Fever & headache' },
    arrivalTime: '08:30', waitMin: 45, priority: 'urgent', aiRisk: 75,
    vitals: { temp: 38.5, bp: '130/85', hr: 92 }, intakeDone: true,
  },
  {
    id: 'P002', name: 'John Mwangi',        age: 58, gender: 'M', afyaId: 'AFY-209817',
    complaint: { sw: 'Maumivu ya kifua', en: 'Chest pain' },
    arrivalTime: '08:45', waitMin: 30, priority: 'emergency', aiRisk: 92,
    vitals: { temp: 37.2, bp: '158/98', hr: 108 }, intakeDone: true,
  },
  {
    id: 'P003', name: 'Grace Kimani',       age: 28, gender: 'F', afyaId: 'AFY-334422',
    complaint: { sw: 'Uchunguzi wa mimba', en: 'ANC visit' },
    arrivalTime: '09:00', waitMin: 60, priority: 'routine', aiRisk: 18,
    intakeDone: true,
  },
  {
    id: 'P004', name: "David Ng'ang'a",     age: 45, gender: 'M', afyaId: 'AFY-441009',
    complaint: { sw: 'Kikohozi cha wiki 2', en: 'Cough × 2 weeks' },
    arrivalTime: '09:15', waitMin: 75, priority: 'urgent', aiRisk: 68,
    vitals: { temp: 37.8, bp: '125/80', hr: 88 }, intakeDone: false,
  },
  {
    id: 'P005', name: 'Fatuma Ali',         age: 65, gender: 'F', afyaId: 'AFY-559812',
    complaint: { sw: 'Ufuatiliaji wa kisukari', en: 'Diabetes follow-up' },
    arrivalTime: '09:30', waitMin: 90, priority: 'routine', aiRisk: 42,
    intakeDone: true,
  },
];

const AI_TIPS: Record<string, string> = {
  P001: 'Malaria RDT suggested — fever + headache pattern. Consider AL if positive.',
  P002: 'High cardiac risk (AI 92). Consider ECG before consultation.',
  P003: 'ANC visit: check fundal height, BP, FHR. Iron + folic acid refill due.',
  P004: 'TB screen warranted — 2-week cough + weight loss history. Order sputum AFB.',
  P005: 'HbA1c last done 4 months ago. Recommend retest. Check foot exam.',
};

const tr = {
  sw: {
    queue: 'Foleni ya Leo', search: 'Tafuta mgonjwa...', seen: 'Walioonwa', waiting: 'Wanaosubiri',
    startVisit: 'Anza Ziara', complete: 'Kamilisha Ziara', prescribe: 'Andika Dawa',
    summary: 'Muhtasari', history: 'Historia', admin: 'Utawala',
    vitals: 'Alama Muhimu', complaint: 'Malalamiko', aiPanel: 'Ushauri wa AI',
    rxTemplates: 'Templeti za Dawa', logout: 'Toka', mins: 'dak',
    intakeDone: 'Maelezo yamejazwa', noIntake: 'Hakuna maelezo ya awali',
    risk: 'Hatari',
  },
  en: {
    queue: "Today's Queue", search: 'Search patient...', seen: 'Seen', waiting: 'Waiting',
    startVisit: 'Start Visit', complete: 'Complete Visit', prescribe: 'Prescribe',
    summary: 'Summary', history: 'History', admin: 'Admin',
    vitals: 'Vital Signs', complaint: 'Chief Complaint', aiPanel: 'AI Guidance',
    rxTemplates: 'Rx Templates', logout: 'Log Out', mins: 'min',
    intakeDone: 'Pre-visit done', noIntake: 'No pre-visit intake',
    risk: 'Risk',
  },
};

export function ClinicalDashboard({ language, onLogout, providerName }: ClinicalDashboardProps) {
  const t = tr[language];
  const [search, setSearch] = useState('');
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [chartTab, setChartTab] = useState<ChartTab>('summary');
  const [aiOpen, setAiOpen] = useState(true);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [selectedRx, setSelectedRx] = useState<string | null>(null);

  const filtered = MOCK_PATIENTS
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const order = { emergency: 0, urgent: 1, routine: 2 };
      return order[a.priority] - order[b.priority];
    });

  const seenCount  = seenIds.size;
  const waitCount  = MOCK_PATIENTS.length - seenCount;

  /* ── Patient Chart View ── */
  if (activePatient) {
    const meta = PRIORITY_META[activePatient.priority];
    const aiTip = AI_TIPS[activePatient.id] ?? '';

    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        {/* 80px Compact Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-slate-100"
          style={{ background: '#0f172a', minHeight: 80 }}
        >
          <button
            type="button"
            aria-label={language === 'sw' ? 'Rudi kwenye orodha' : 'Back to queue'}
            onClick={() => { setActivePatient(null); setChartTab('summary'); setSelectedRx(null); }}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0"
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white font-bold text-base truncate">{activePatient.name}</h1>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: meta.bg, color: meta.color }}
              >
                {meta.label[language]}
              </span>
            </div>
            <p className="text-white/60 text-xs mt-0.5">
              {activePatient.age}y {activePatient.gender} · {activePatient.afyaId}
              {activePatient.vitals && (
                <> · {activePatient.vitals.temp}°C · {activePatient.vitals.bp} · HR {activePatient.vitals.hr}</>
              )}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
            style={{ background: meta.color }}
          >
            {activePatient.aiRisk}
          </div>
        </div>

        {/* 3-Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-white">
          {(['summary', 'history', 'admin'] as ChartTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setChartTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] focus-visible:ring-inset ${
                chartTab === tab ? 'text-[#0d9488]' : 'text-gray-400'
              }`}
            >
              {t[tab]}
              {chartTab === tab && (
                <motion.div
                  layoutId="chart-tab-indicator"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#0d9488]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pb-36">
          <AnimatePresence mode="wait">
            {chartTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4"
              >
                {/* Chief Complaint */}
                <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t.complaint}</p>
                  <p className="text-[#0f172a] font-semibold">{activePatient.complaint[language]}</p>
                </div>

                {/* Vitals */}
                {activePatient.vitals && (
                  <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t.vitals}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Temp', value: `${activePatient.vitals.temp}°C`, ok: activePatient.vitals.temp < 37.5 },
                        { label: 'BP',   value: activePatient.vitals.bp, ok: true },
                        { label: 'HR',   value: `${activePatient.vitals.hr}`, ok: activePatient.vitals.hr < 100 },
                      ].map((v) => (
                        <div key={v.label} className="text-center p-3 rounded-xl" style={{ background: v.ok ? '#f0fdf4' : '#fee2e2' }}>
                          <p className="text-xs text-gray-400 mb-1">{v.label}</p>
                          <p className="font-bold text-[#0f172a] text-sm">{v.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Guidance Panel */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAiOpen((o) => !o)}
                    className="w-full flex items-center justify-between p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] focus-visible:ring-inset"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#0d9488]" />
                      <span className="text-sm font-semibold text-[#0f172a]">{t.aiPanel}</span>
                    </div>
                    {aiOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  <AnimatePresence>
                    {aiOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-[#ccfbf1]">
                          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{aiTip}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Rx Templates */}
                <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t.rxTemplates}</p>
                  <div className="flex flex-wrap gap-2">
                    {RX_TEMPLATES.map((rx) => (
                      <button
                        key={rx.id}
                        type="button"
                        onClick={() => setSelectedRx(selectedRx === rx.id ? null : rx.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
                        style={{
                          background: selectedRx === rx.id ? '#0d9488' : '#f8fafc',
                          color: selectedRx === rx.id ? '#ffffff' : '#0d9488',
                          borderColor: '#0d9488',
                        }}
                      >
                        {rx.label}
                      </button>
                    ))}
                  </div>
                  {selectedRx && RX_TEMPLATES.find((r) => r.id === selectedRx)?.drugs && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 rounded-xl bg-[#ccfbf1]"
                    >
                      <p className="text-xs font-mono text-[#0f766e]">
                        {RX_TEMPLATES.find((r) => r.id === selectedRx)?.drugs}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {chartTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-3"
              >
                {[
                  { date: '2026-03-15', dx: 'Malaria (confirmed)', rx: 'AL completed', outcome: 'Recovered' },
                  { date: '2026-01-08', dx: 'URTI', rx: 'Amoxicillin 5d', outcome: 'Resolved' },
                  { date: '2025-11-22', dx: 'ANC visit 28w', rx: 'Iron + Folic refill', outcome: 'Normal' },
                ].map((visit) => (
                  <div key={visit.date} className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{visit.date}</p>
                        <p className="text-[#0f172a] font-semibold text-sm">{visit.dx}</p>
                        <p className="text-gray-500 text-xs mt-1">{visit.rx}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#16a34a] bg-[#dcfce7] px-2 py-0.5 rounded-full flex-shrink-0">
                        {visit.outcome}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {chartTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4"
              >
                <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-3">
                  {[
                    { label: 'Insurance', value: 'NHIF — Active' },
                    { label: 'Facility', value: 'Muhimbili National Hospital' },
                    { label: 'Ward', value: 'OPD Block A' },
                    { label: 'Referral', value: 'None' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span className="text-xs text-gray-400">{row.label}</span>
                      <span className="text-sm font-semibold text-[#0f172a]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pinned Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setSeenIds((prev) => new Set([...prev, activePatient.id]));
              setActivePatient(null);
            }}
            className="flex-1 h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
          >
            <CheckCircle2 size={16} />
            {t.complete}
          </button>
          <button
            type="button"
            onClick={() => setChartTab('summary')}
            className="h-12 px-4 rounded-xl font-bold text-sm border-2 border-[#0d9488] text-[#0d9488] flex items-center justify-center gap-2"
          >
            <Pill size={16} />
            {t.prescribe}
          </button>
        </div>
      </div>
    );
  }

  /* ── Patient Queue View ── */
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Top Bar */}
      <div className="px-4 pt-12 pb-5" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 55%, #0d9488 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-black text-xl">{t.queue}</h1>
            <p className="text-white/60 text-xs mt-0.5">Dr. {providerName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Bell size={18} className="text-white" />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
              aria-label={t.logout}
            >
              <LogOut size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex gap-3">
          {[
            { label: t.seen,    value: seenCount,    color: '#ccfbf1',  text: '#0f766e' },
            { label: t.waiting, value: waitCount,    color: '#fef3c7',  text: '#92400e' },
            { label: 'Total',   value: MOCK_PATIENTS.length, color: 'rgba(255,255,255,0.15)', text: '#fff' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-xl p-2.5 text-center"
              style={{ background: s.color }}
            >
              <p className="text-xl font-black" style={{ color: s.text }}>{s.value}</p>
              <p className="text-xs font-semibold" style={{ color: s.text, opacity: 0.8 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 bg-white border-b border-slate-100">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#f8fafc] text-sm text-[#0f172a] placeholder-gray-400 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
          />
        </div>
      </div>

      {/* Patient Queue */}
      <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 space-y-3">
        {filtered.map((patient, i) => {
          const meta = PRIORITY_META[patient.priority];
          const isSeen = seenIds.has(patient.id);
          return (
            <motion.button
              key={patient.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { setActivePatient(patient); setChartTab('summary'); }}
              className={`w-full text-left bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] ${
                isSeen ? 'opacity-50 border-transparent' : 'border-transparent hover:border-[#0d9488]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                  style={{ background: meta.color }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[#0f172a] text-sm truncate">{patient.name}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label[language]}
                      </span>
                      {isSeen && (
                        <CheckCircle2 size={14} className="text-[#16a34a]" />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{patient.complaint[language]}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock size={11} />
                      {patient.waitMin}{t.mins}
                    </span>
                    <span className="text-[11px] text-gray-400">{patient.age}y {patient.gender}</span>
                    {patient.intakeDone ? (
                      <span className="text-[11px] text-[#0d9488] font-semibold">{t.intakeDone}</span>
                    ) : (
                      <span className="text-[11px] text-[#d97706]">{t.noIntake}</span>
                    )}
                    <span
                      className="text-[11px] font-bold ml-auto"
                      style={{ color: patient.aiRisk >= 75 ? '#dc2626' : patient.aiRisk >= 50 ? '#d97706' : '#16a34a' }}
                    >
                      AI {patient.aiRisk}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
