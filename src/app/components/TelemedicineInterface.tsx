/**
 * TelemedicineInterface — CREOVA Medical Premium Telemedicine
 * Video/audio/text consultations with Tanzania doctors
 * Inspired by Babylon Health + Abridge design language
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Video, Phone, MessageCircle, Star, Clock, Send,
  Mic, MicOff, VideoOff, PhoneOff, X, ChevronRight, Wifi,
  Shield, CheckCircle2, Sparkles,
} from 'lucide-react';

interface TelemedicineInterfaceProps {
  language: 'sw' | 'en';
  onBack: () => void;
}

interface Provider {
  id: string;
  name: string;
  specialty: { sw: string; en: string };
  hospital: string;
  available: boolean;
  waitMin: number;
  rating: number;
  consultations: number;
  initials: string;
  color: string;
  verifiedBy: string;
}

interface ChatMsg {
  id: string;
  sender: 'user' | 'provider';
  text: string;
  time: string;
}

type View = 'list' | 'chat' | 'call';

const PROVIDERS: Provider[] = [
  {
    id: 'dr1', name: 'Dr. Fatuma Rashid', specialty: { sw: 'Daktari wa Jumla', en: 'General Physician' },
    hospital: 'Muhimbili National Hospital', available: true, waitMin: 5, rating: 4.9,
    consultations: 1240, initials: 'FR', color: '#0d9488', verifiedBy: 'CSEE Tanzania',
  },
  {
    id: 'dr2', name: 'Dr. Emmanuel Mwangi', specialty: { sw: 'Mtaalamu wa Moyo', en: 'Cardiologist' },
    hospital: 'Aga Khan Hospital Dar es Salaam', available: true, waitMin: 12, rating: 4.8,
    consultations: 890, initials: 'EM', color: '#0f172a', verifiedBy: 'CSEE Tanzania',
  },
  {
    id: 'dr3', name: 'Dr. Amina Juma', specialty: { sw: 'Daktari wa Watoto', en: 'Paediatrician' },
    hospital: 'Mwananyamala Regional Hospital', available: true, waitMin: 8, rating: 4.7,
    consultations: 2100, initials: 'AJ', color: '#7c3aed', verifiedBy: 'CSEE Tanzania',
  },
  {
    id: 'dr4', name: 'Dr. Patrick Kimaro', specialty: { sw: 'Mshauri wa Uzazi', en: 'Obstetrician' },
    hospital: 'Amana District Hospital', available: false, waitMin: 25, rating: 4.6,
    consultations: 650, initials: 'PK', color: '#d97706', verifiedBy: 'CSEE Tanzania',
  },
];

const tr = {
  sw: {
    title: 'Zungumza na Daktari',
    subtitle: 'Mashauriano salama ya kidijitali',
    available: 'Anapatikana',
    busy: 'Ana shughuli',
    wait: 'muda wa kusubiri',
    mins: 'dak',
    consultations: 'mashauriano',
    startChat: 'Anza Mazungumzo',
    videoCall: 'Simu ya Video',
    voiceCall: 'Simu ya Sauti',
    typeMsg: 'Andika ujumbe...',
    send: 'Tuma',
    endCall: 'Maliza Simu',
    connecting: 'Inaunganisha...',
    secure: 'Salama na ya Siri',
    tmda: 'Imeidhinishwa na TMDA',
    moh: 'Imesajiliwa MoH',
  },
  en: {
    title: 'Talk to a Doctor',
    subtitle: 'Secure digital consultations',
    available: 'Available',
    busy: 'Busy',
    wait: 'wait time',
    mins: 'min',
    consultations: 'consultations',
    startChat: 'Start Chat',
    videoCall: 'Video Call',
    voiceCall: 'Voice Call',
    typeMsg: 'Type a message...',
    send: 'Send',
    endCall: 'End Call',
    connecting: 'Connecting...',
    secure: 'Secure & Private',
    tmda: 'TMDA Approved',
    moh: 'MoH Registered',
  },
};

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function TelemedicineInterface({ language, onBack }: TelemedicineInterfaceProps) {
  const t = tr[language];
  const [view, setView] = useState<View>('list');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [callState, setCallState] = useState<'connecting' | 'active'>('connecting');
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (view === 'call' && callState === 'connecting') {
      const t = setTimeout(() => setCallState('active'), 2500);
      return () => clearTimeout(t);
    }
  }, [view, callState]);

  useEffect(() => {
    if (view === 'call' && callState === 'active') {
      const interval = setInterval(() => setCallSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [view, callState]);

  function startChat(provider: Provider) {
    setSelectedProvider(provider);
    setMessages([
      {
        id: '0',
        sender: 'provider',
        text: language === 'sw'
          ? `Habari! Mimi ni ${provider.name}. Ninaweza kukusaidiaje leo?`
          : `Hello! I'm ${provider.name}. How can I help you today?`,
        time: nowTime(),
      },
    ]);
    setView('chat');
  }

  function sendMessage() {
    if (!inputValue.trim()) return;
    const msg: ChatMsg = { id: String(Date.now()), sender: 'user', text: inputValue.trim(), time: nowTime() };
    setMessages((prev) => [...prev, msg]);
    setInputValue('');
    setTimeout(() => {
      const reply: ChatMsg = {
        id: String(Date.now() + 1),
        sender: 'provider',
        text: language === 'sw'
          ? 'Asante kwa maelezo. Ninaelewa hali yako vizuri sasa. Napendekeza upime shinikizo la damu leo na kurudi kwa uchunguzi zaidi ikiwa dalili zitaendelea.'
          : 'Thank you for sharing. I understand your condition better now. I recommend checking your blood pressure today and following up if symptoms persist.',
        time: nowTime(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1800);
  }

  function formatCallTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  }

  /* ── Video Call View ── */
  if (view === 'call' && selectedProvider) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col">
        {/* Remote video placeholder */}
        <div className="flex-1 relative flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 30%, #134e4a 0%, #0f172a 70%)' }}
          />
          {callState === 'connecting' ? (
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-black text-white mb-4"
                style={{ background: selectedProvider.color }}
              >
                {selectedProvider.initials}
              </div>
              <p className="text-white font-bold text-lg">{selectedProvider.name}</p>
              <p className="text-white/60 text-sm mt-1">{t.connecting}</p>
              <div className="flex gap-2 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#0d9488]"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-black text-white mb-3"
                style={{ background: selectedProvider.color }}
              >
                {selectedProvider.initials}
              </div>
              <p className="text-white font-bold text-xl">{selectedProvider.name}</p>
              <p className="text-white/70 text-sm mt-1">{selectedProvider.specialty[language]}</p>
              <div className="flex items-center gap-2 mt-3 bg-white/10 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                <span className="text-white/80 text-sm font-mono">{formatCallTime(callSeconds)}</span>
              </div>
            </div>
          )}

          {/* Local video pip */}
          <div className="absolute top-16 right-4 w-24 h-32 rounded-2xl overflow-hidden border-2 border-white/20"
            style={{ background: '#1e293b' }}
          >
            {videoOn ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#0d9488] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">Me</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0f172a]">
                <VideoOff size={20} className="text-white/40" />
              </div>
            )}
          </div>
        </div>

        {/* Call controls */}
        <div className="bg-[#1e293b]/80 backdrop-blur-sm px-8 py-6 pb-10">
          <div className="flex justify-center gap-6">
            <button
              type="button"
              aria-label={micOn ? 'Zima Maikrofoni' : 'Washa Maikrofoni'}
              onClick={() => setMicOn((o) => !o)}
              className="w-14 h-14 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{ background: micOn ? 'rgba(255,255,255,0.15)' : '#dc2626' }}
            >
              {micOn ? <Mic size={22} className="text-white" /> : <MicOff size={22} className="text-white" />}
            </button>
            <button
              type="button"
              aria-label={t.endCall}
              onClick={() => { setView('list'); setCallState('connecting'); setCallSeconds(0); }}
              className="w-16 h-16 rounded-full bg-[#dc2626] flex items-center justify-center shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <PhoneOff size={26} className="text-white" />
            </button>
            <button
              type="button"
              aria-label={videoOn ? 'Zima Video' : 'Washa Video'}
              onClick={() => setVideoOn((o) => !o)}
              className="w-14 h-14 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{ background: videoOn ? 'rgba(255,255,255,0.15)' : '#dc2626' }}
            >
              {videoOn ? <Video size={22} className="text-white" /> : <VideoOff size={22} className="text-white" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Chat View ── */
  if (view === 'chat' && selectedProvider) {
    return (
      <div className="flex flex-col h-screen bg-[#f8fafc]">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 pt-12 pb-4 flex-shrink-0"
          style={{ background: 'linear-gradient(160deg, #0f172a 0%, #134e4a 100%)' }}
        >
          <button
            type="button"
            aria-label={language === 'sw' ? 'Rudi' : 'Back'}
            onClick={() => setView('list')}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
            style={{ background: selectedProvider.color }}
          >
            {selectedProvider.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{selectedProvider.name}</p>
            <p className="text-white/50 text-[10px]">{selectedProvider.specialty[language]}</p>
          </div>
          <button
            type="button"
            aria-label={t.videoCall}
            onClick={() => { setView('call'); setCallState('connecting'); }}
            className="w-9 h-9 rounded-xl bg-[#0d9488] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Video size={16} className="text-white" />
          </button>
          <button
            type="button"
            aria-label={t.voiceCall}
            onClick={() => { setView('call'); setCallState('connecting'); }}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Phone size={16} className="text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'text-white rounded-tr-sm'
                  : 'text-[#0f172a] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] rounded-tl-sm'
              }`}
              style={msg.sender === 'user' ? { background: 'linear-gradient(135deg, #0d9488, #0f766e)' } : undefined}
              >
                {msg.text}
                <p className="text-[10px] mt-1 opacity-60">{msg.time}</p>
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 bg-white border-t border-slate-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={t.typeMsg}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 h-11 px-4 rounded-2xl bg-[#f8fafc] text-sm text-[#0f172a] placeholder-gray-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
            />
            <button
              type="button"
              aria-label={t.send}
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              className="w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Provider List View ── */
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #134e4a 100%)' }}
      >
        <button
          type="button"
          aria-label={language === 'sw' ? 'Rudi' : 'Back'}
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
        >
          <ArrowLeft size={16} />
          {language === 'sw' ? 'Rudi' : 'Back'}
        </button>
        <h1 className="text-white font-black text-2xl">{t.title}</h1>
        <p className="text-white/60 text-sm mt-1">{t.subtitle}</p>
        <div className="flex gap-3 mt-4">
          {[
            { icon: Shield, label: t.secure },
            { icon: CheckCircle2, label: t.tmda },
            { icon: Sparkles, label: t.moh },
          ].map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1">
                <Icon size={11} className="text-[#0d9488]" />
                <span className="text-[10px] text-white/70 font-semibold">{badge.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provider Cards */}
      <div className="px-4 pt-5 pb-10 space-y-3">
        {PROVIDERS.map((provider, i) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black text-white flex-shrink-0"
                style={{ background: provider.color }}
              >
                {provider.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-[#0f172a] text-sm truncate">{provider.name}</p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: provider.available ? '#dcfce7' : '#f1f5f9',
                      color: provider.available ? '#15803d' : '#64748b',
                    }}
                  >
                    {provider.available ? t.available : t.busy}
                  </span>
                </div>
                <p className="text-[#0d9488] text-xs font-semibold mt-0.5">{provider.specialty[language]}</p>
                <p className="text-gray-400 text-xs mt-0.5 truncate">{provider.hospital}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[11px] text-[#f59e0b]">
                    <Star size={10} fill="#f59e0b" />
                    {provider.rating}
                  </span>
                  <span className="text-[11px] text-gray-400">{provider.consultations.toLocaleString()} {t.consultations}</span>
                  {provider.available && (
                    <span className="flex items-center gap-1 text-[11px] text-[#0d9488]">
                      <Clock size={10} />
                      {provider.waitMin} {t.mins} {t.wait}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {provider.available && (
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => startChat(provider)}
                  className="flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
                >
                  <MessageCircle size={14} />
                  {t.startChat}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedProvider(provider); setView('call'); }}
                  className="flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]"
                >
                  <Video size={14} />
                  {t.videoCall}
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
