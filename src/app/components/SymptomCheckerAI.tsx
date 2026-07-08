import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, AlertCircle, CheckCircle, Info, Send, Activity, BrainCircuit } from 'lucide-react';
import { Button } from './ui/button';
import { getChatModel } from '../services/firebaseAI';
import { ClinicalTriageEngine, TriageResult } from './ClinicalTriageEngine';
import { AutonomousDispatchEngine, DispatchTask } from '../services/AutonomousDispatchEngine';

interface SymptomCheckerAIProps {
  language: 'sw' | 'en';
  onBack: () => void;
  onBookAppointment: () => void;
  onContactCHW: () => void;
}

interface Message {
  id: string;
  type: 'ai' | 'user' | 'system';
  content: string;
  timestamp: Date;
}

export function SymptomCheckerAI({
  language,
  onBack,
  onBookAppointment,
  onContactCHW,
}: SymptomCheckerAIProps) {
  const [step, setStep] = useState<'intro' | 'assessment' | 'results'>('intro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [assessment, setAssessment] = useState<TriageResult | null>(null);
  const [dispatchTask, setDispatchTask] = useState<DispatchTask | null>(null);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = {
    sw: {
      title: 'Tathmini ya Dalili na AI',
      subtitle: 'Tafadhali nieleze unavyojiskia kwa maneno yako mwenyewe.',
      intro: 'Habari! Mimi ni msaidizi wako wa afya. Tafadhali niandikie dalili zako zote, na nitakuuliza maswali machache ili kuelewa vizuri.',
      start: 'Anza Mazungumzo',
      placeholder: 'Andika hapa...',
      resultsTitle: 'Matokeo ya Tathmini',
      book: 'Panga Miadi',
      chw: 'Wasiliana na CHW',
      startOver: 'Anza Upya',
      dispatchSuccess: 'Mhudumu wa afya ametumwa na yuko njiani kukusaidia.'
    },
    en: {
      title: 'AI Symptom Assessment',
      subtitle: 'Please describe how you are feeling in your own words.',
      intro: 'Hello! I am your AI health assistant. Please describe your symptoms, and I will ask a few follow-up questions to understand better.',
      start: 'Start Chat',
      placeholder: 'Type here...',
      resultsTitle: 'Assessment Results',
      book: 'Book Appointment',
      chw: 'Contact CHW',
      startOver: 'Start Over',
      dispatchSuccess: 'A Community Health Worker has been autonomously dispatched and is on their way.'
    }
  }[language];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initChat = async () => {
    setStep('assessment');
    
    const systemInstruction = `
      You are an empathetic, clinical AI assistant for AfyaCare.
      Language: ${language === 'sw' ? 'Swahili' : 'English'}.
      Ask 2-3 probing questions to understand the patient's symptoms (e.g. duration, severity, fever).
      Ask one question at a time.
      Once you have enough information to make a triage decision (mild, moderate, urgent, emergency), reply EXACTLY with the string: "[ASSESSMENT_COMPLETE]" and nothing else.
    `;
    
    chatSessionRef.current = getChatModel().startChat({
      history: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: 'Understood. I will ask questions and output [ASSESSMENT_COMPLETE] when done.' }] }
      ]
    });

    setMessages([{
      id: Date.now().toString(),
      type: 'ai',
      content: language === 'sw' ? 'Nini kinakusumbua leo? Tafadhali nieleze.' : 'What is bothering you today? Please tell me.',
      timestamp: new Date()
    }]);
  };

  const handleSend = async () => {
    if (!userInput.trim() || isTyping) return;

    const userMsg = userInput.trim();
    setUserInput('');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: userMsg,
      timestamp: new Date()
    }]);
    
    setIsTyping(true);
    
    try {
      const response = await chatSessionRef.current.sendMessage(userMsg);
      const text = response.response.text();
      
      if (text.includes('[ASSESSMENT_COMPLETE]')) {
        await finalizeAssessment();
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          content: text,
          timestamp: new Date()
        }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: 'Connection error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const finalizeAssessment = async () => {
    setIsTyping(true);
    const transcript = messages.map(m => `${m.type.toUpperCase()}: ${m.content}`).join('\n');
    
    try {
      const result = await ClinicalTriageEngine.assessSymptomsWithAI(transcript, language);
      setAssessment(result);
      
      if (result.level === 'urgent' || result.level === 'emergency') {
         const dispatched = await AutonomousDispatchEngine.dispatchCHW(
           { name: 'Current Patient', phone: '0700000000', location: { lat: -6.8, lng: 39.25 }, language },
           result
         );
         if (dispatched) {
           setDispatchTask(dispatched);
         }
      }
      
      setStep('results');
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'emergency': return '#DC2626';
      case 'urgent': return '#EF4444';
      case 'moderate': return '#F59E0B';
      default: return '#10B981';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-semibold text-lg">{t.title}</h2>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>
      </div>

      {step === 'intro' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center p-8 text-center flex-1"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-blue-400 rounded-full blur-xl"
            />
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center border border-blue-200 shadow-inner">
              <BrainCircuit className="text-blue-600 w-10 h-10" />
            </div>
          </div>
          <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">{t.intro}</p>
          <Button onClick={initChat} className="w-full max-w-xs shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transition-all text-lg py-6 rounded-2xl">
            {t.start}
          </Button>
        </motion.div>
      )}

      {step === 'assessment' && (
        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-3xl ${
                    msg.type === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-sm shadow-md shadow-blue-200/50' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-bl-sm shadow-sm flex gap-1.5 items-center h-12">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t.placeholder}
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
              />
              <button 
                onClick={handleSend}
                disabled={!userInput.trim() || isTyping}
                className="bg-blue-600 text-white p-2 rounded-full disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'results' && assessment && (
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-bold mb-6 text-center">{t.resultsTitle}</h2>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-8 mb-6 text-white text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
            style={{ backgroundColor: getRiskColor(assessment.level) }}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex justify-center mb-4"
              >
                <AlertCircle size={56} className="drop-shadow-lg" />
              </motion.div>
              <h3 className="text-3xl font-bold capitalize mb-2 drop-shadow-md">{assessment.level}</h3>
              <p className="text-lg text-white/90 font-medium">{assessment.recommendation}</p>
            </div>
          </motion.div>

          {dispatchTask && (
             <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 shadow-sm">
                <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                  <CheckCircle size={18} /> Autonomous Dispatch Active
                </h4>
                <p className="text-green-700">{t.dispatchSuccess}</p>
             </div>
          )}

          <div className="bg-white border rounded-xl p-5 mb-6 shadow-sm">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Info size={18} className="text-blue-500"/> Reasoning
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {assessment.reasoning.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 border rounded-xl p-5 mb-8">
            <h4 className="font-semibold mb-3 text-gray-500 text-sm uppercase">Safety Disclaimers</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {assessment.disclaimers?.map((d: string, i: number) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            {assessment.level === 'emergency' ? (
              <Button onClick={() => window.location.href = 'tel:114'} className="bg-red-600 hover:bg-red-700 text-lg py-6">
                Call 114 Emergency
              </Button>
            ) : (
              <Button onClick={onBookAppointment} className="py-6 text-lg">{t.book}</Button>
            )}
            <Button variant="outline" onClick={onContactCHW}>{t.chw}</Button>
            <Button variant="ghost" onClick={() => {
              setStep('intro');
              setMessages([]);
            }}>{t.startOver}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
