/**
 * AIHealthChat — CREOVA Medical AI Copilot
 * Conversational AI healthcare assistant for Tanzania patients
 * Agentic: proactively offers actions, books appointments, checks symptoms
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Mic, Send, Sparkles, Calendar, Pill, Activity,
  Video, Phone, MapPin, ChevronRight, AlertTriangle, Heart, X,
} from 'lucide-react';
import { useAppStore } from '@/app/store/useAppStore';

interface AIHealthChatProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

type MessageRole = 'user' | 'ai';

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  time: string;
  actions?: { label: string; route: string; icon: React.ElementType }[];
  isTyping?: boolean;
}

const SUGGESTED_PROMPTS = {
  sw: [
    'Nina homa na maumivu ya kichwa',
    'Nataka kupanga miadi',
    'Ninahitaji dawa zangu',
    'Ninaposikia maumivu ya kifua',
    'Msaada wa mama mjamzito',
  ],
  en: [
    'I have fever and headache',
    'I want to book an appointment',
    'I need a prescription refill',
    'I have chest pain',
    'Maternal health support',
  ],
};

const AI_RESPONSES: Record<string, { text: Record<string, string>; actions?: { label: string; route: string; icon: React.ElementType }[] }> = {
  fever: {
    text: {
      sw: 'Naelewa. Homa na maumivu ya kichwa yanaweza kuwa dalili za malaria, URTI, au hali nyingine. Hebu niulize maswali machache:\n\n• Je, homa ilikuwa ngapi? (joto la kawaida, wastani, au kali?)\n• Je, una kikohozi au maumivu ya koo?\n• Je, umetumia dawa yoyote leo?\n\nKwa sasa, pumzika na kunywa maji mengi. Naweza kukusaidia kupanga miadi au kuunganisha na daktari sasa hivi.',
      en: "I understand. Fever and headache can be signs of malaria, URTI, or other conditions. Let me ask a few questions:\n\n• How high is the fever? (mild, moderate, or severe?)\n• Do you have cough or sore throat?\n• Have you taken any medication today?\n\nFor now, rest and drink plenty of fluids. I can help you book an appointment or connect with a doctor right now.",
    },
    actions: [
      { label: 'Check Symptoms', route: 'symptom-checker', icon: Activity },
      { label: 'Book Appointment', route: 'appointments', icon: Calendar },
      { label: 'Talk to Doctor', route: 'telemedicine', icon: Video },
    ],
  },
  appointment: {
    text: {
      sw: 'Sawa! Nitakusaidia kupanga miadi. Una uchaguzi huu:\n\n🏥 **Muhimbili National Hospital** — leo saa 4 asubuhi\n🏥 **Amana District Hospital** — kesho saa 8 asubuhi\n🏥 **Mwananyamala Hospital** — kesho saa 10 asubuhi\n\nUnataka niongeze miadi? Au ungependa kuona kliniki karibu nawe?',
      en: "Sure! I'll help you book an appointment. Here are your options:\n\n🏥 **Muhimbili National Hospital** — today at 10:00 AM\n🏥 **Amana District Hospital** — tomorrow at 8:00 AM\n🏥 **Mwananyamala Hospital** — tomorrow at 10:00 AM\n\nShall I book one? Or would you like to see clinics near you?",
    },
    actions: [
      { label: 'Book Now', route: 'appointments', icon: Calendar },
      { label: 'Find Clinics', route: 'clinic-finder', icon: MapPin },
    ],
  },
  prescription: {
    text: {
      sw: 'Sawa. Niangalie rekodi zako... 📋\n\nDawa zako za sasa:\n• **Metformin 500mg** — mara 2 kwa siku\n• **Lisinopril 10mg** — mara 1 kwa siku\n\nDawa zako zinahitaji kujazwa upya tarehe 2026-05-15. Unaweza kwenda duka lolote la dawa linalounda uhusiano na CREOVA, au nitatoa agizo la dawa ya kidijitali.',
      en: "Let me check your records... 📋\n\nYour current medications:\n• **Metformin 500mg** — twice daily\n• **Lisinopril 10mg** — once daily\n\nYour refill is due 2026-05-15. You can visit any partnered pharmacy, or I can generate a digital prescription.",
    },
    actions: [
      { label: 'View Medications', route: 'medications', icon: Pill },
      { label: 'Find Pharmacy', route: 'clinic-finder', icon: MapPin },
    ],
  },
  chest: {
    text: {
      sw: '⚠️ **Tahadhari ya Dharura**\n\nMaumivu ya kifua yanaweza kuwa ya moyo au mapafu na yanahitaji tathmini ya haraka.\n\nPiga simu ya dharura sasa hivi au nenda hospitali ya karibu nawe.',
      en: '⚠️ **Emergency Warning**\n\nChest pain can indicate a cardiac or pulmonary emergency and requires immediate evaluation.\n\nCall emergency services now or go to the nearest hospital.',
    },
    actions: [
      { label: 'EMERGENCY', route: 'emergency', icon: AlertTriangle },
      { label: 'Find Hospital', route: 'clinic-finder', icon: MapPin },
    ],
  },
  maternal: {
    text: {
      sw: 'Karibu! Ninatumai mama na mtoto wako mko salama 💚\n\nNinaweza kukusaidia na:\n• Ratiba ya ziara za kabla ya kuzaa (ANC)\n• Kufuatilia uzito na afya ya mtoto\n• Maswali kuhusu lishe wakati wa ujauzito\n• Dawa za vitamini (chuma, asidi ya folic)\n\nUnataka kuanza na nini?',
      en: "Welcome! I hope you and your baby are doing well 💚\n\nI can help you with:\n• Antenatal care (ANC) appointment schedule\n• Tracking baby weight and health milestones\n• Nutrition questions during pregnancy\n• Vitamin supplements (iron, folic acid)\n\nWhat would you like to start with?",
    },
    actions: [
      { label: 'Maternal Care', route: 'maternal', icon: Heart },
      { label: 'Book ANC Visit', route: 'appointments', icon: Calendar },
    ],
  },
};

const GREETINGS = {
  sw: 'Habari! Mimi ni msaidizi wako wa AI wa afya. Ninaweza kukusaidia na dalili, miadi, dawa, na zaidi. Je, ninaweza kukusaidiaje leo?',
  en: "Hello! I'm your AI health copilot. I can help you with symptoms, appointments, medications, and more. How can I help you today?",
};

function matchResponse(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('homa') || lower.includes('fever') || lower.includes('kichwa') || lower.includes('headache')) return 'fever';
  if (lower.includes('miadi') || lower.includes('appointment') || lower.includes('book')) return 'appointment';
  if (lower.includes('dawa') || lower.includes('medication') || lower.includes('prescription') || lower.includes('refill')) return 'prescription';
  if (lower.includes('kifua') || lower.includes('chest')) return 'chest';
  if (lower.includes('mama') || lower.includes('maternal') || lower.includes('mjamzito') || lower.includes('pregnant')) return 'maternal';
  return null;
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function AIHealthChat({ onBack, onNavigate }: AIHealthChatProps) {
  const { language: ctxLang } = useAppStore();
  const lang = (ctxLang ?? 'sw') as 'sw' | 'en';
  const prompts = SUGGESTED_PROMPTS[lang];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'ai',
      text: GREETINGS[lang],
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    setShowPrompts(false);

    const userMsg: ChatMessage = { id: uid(), role: 'user', text: text.trim(), time: nowTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      const key = matchResponse(text);
      const resp = key ? AI_RESPONSES[key] : null;
      const aiText = resp
        ? resp.text[lang]
        : lang === 'sw'
          ? 'Naelewa. Swali lako ni muhimu. Ninaomba msamaha, lakini sijui jibu sahihi kwa hilo. Jaribu kuwasiliana na daktari au piga simu ya dharura ikiwa ni hali mbaya.'
          : "I understand. Your question is important. I don't have a confident answer for that right now. Please consult a doctor or call emergency if it's urgent.";

      const aiMsg: ChatMessage = {
        id: uid(),
        role: 'ai',
        text: aiText,
        time: nowTime(),
        actions: resp?.actions,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1400 + Math.random() * 600);
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-4 flex-shrink-0"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #134e4a 100%)' }}
      >
        <button
          type="button"
          aria-label={lang === 'sw' ? 'Rudi' : 'Back'}
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0d9488] flex items-center justify-center flex-shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">CREOVA AI Copilot</p>
              <p className="text-white/50 text-[10px] mt-0.5">
                {lang === 'sw' ? 'Msaidizi wa Afya · Mtandaoni' : 'Health Assistant · Online'}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label={lang === 'sw' ? 'Piga simu ya dharura' : 'Emergency call'}
          onClick={() => onNavigate?.('emergency')}
          className="w-9 h-9 rounded-xl bg-[#dc2626]/20 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626]"
        >
          <Phone size={16} className="text-[#dc2626]" />
        </button>
      </div>

      {/* Suggested prompts */}
      <AnimatePresence>
        {showPrompts && (
          <motion.div
            initial={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="px-4 py-3 bg-white border-b border-slate-100">
              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                {lang === 'sw' ? 'Maswali ya Kawaida' : 'Common questions'}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#0d9488] text-[#0d9488] bg-[#f0fdfa] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-[#0d9488] flex items-center justify-center flex-shrink-0 self-end mb-0.5">
                <Sparkles size={12} className="text-white" />
              </div>
            )}

            <div className={`max-w-[82%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
              {/* Bubble */}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm text-white'
                    : 'rounded-tl-sm text-[#0f172a] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
                }`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #0d9488, #0f766e)' } : undefined}
              >
                {msg.text}
              </div>
              <p className="text-[10px] text-gray-400 px-1">{msg.time}</p>

              {/* Action chips */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.actions.map((action) => {
                    const Icon = action.icon;
                    const isEmergency = action.route === 'emergency';
                    return (
                      <button
                        key={action.route}
                        type="button"
                        onClick={() => onNavigate?.(action.route)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] ${
                          isEmergency
                            ? 'bg-[#dc2626] text-white'
                            : 'bg-[#0d9488] text-white'
                        }`}
                      >
                        <Icon size={12} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2.5 items-end"
            >
              <div className="w-8 h-8 rounded-full bg-[#0d9488] flex items-center justify-center flex-shrink-0">
                <Sparkles size={12} className="text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <div className="flex gap-1.5 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#0d9488]"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 bg-white border-t border-slate-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {!showPrompts && (
          <button
            type="button"
            onClick={() => setShowPrompts(true)}
            className="text-xs text-[#0d9488] font-semibold mb-2 flex items-center gap-1"
          >
            <Sparkles size={11} />
            {lang === 'sw' ? 'Maswali ya kawaida' : 'Suggested prompts'}
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-[#f8fafc] rounded-2xl px-4 py-2.5 border border-slate-200 focus-within:border-[#0d9488] focus-within:ring-2 focus-within:ring-[#0d9488]/20 transition-all">
            <input
              ref={inputRef}
              type="text"
              placeholder={lang === 'sw' ? 'Andika swali la afya...' : 'Type your health question...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              className="flex-1 bg-transparent text-sm text-[#0f172a] placeholder-gray-400 focus:outline-none min-h-[24px]"
            />
            <button
              type="button"
              aria-label={lang === 'sw' ? 'Sauti' : 'Voice input'}
              className="w-7 h-7 rounded-full bg-[#ccfbf1] flex items-center justify-center flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
            >
              <Mic size={14} className="text-[#0d9488]" />
            </button>
          </div>
          <button
            type="button"
            aria-label={lang === 'sw' ? 'Tuma' : 'Send'}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isThinking}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] transition-opacity"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-2">
          {lang === 'sw' ? 'AI inaweza kukosea — wasiliana na daktari kwa hali mbaya' : 'AI can make mistakes — consult a doctor for serious conditions'}
        </p>
      </div>
    </div>
  );
}
