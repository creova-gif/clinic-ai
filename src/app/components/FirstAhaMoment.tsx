import React, { useState } from 'react';
import { Search, UserPlus, ClipboardCheck, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export type UserRole = 'patient' | 'chw' | 'clinician';

interface FirstAhaMomentProps {
  language: 'sw' | 'en';
  role: UserRole;
  onComplete: (data: any) => void;
}

const translations = {
  sw: {
    patient: {
      title: 'Hebu tujaribu pamoja!',
      subtitle: 'Jibu maswali 2 ya haraka',
      question1: 'Una hali gani leo?',
      question2: 'Unaumwa wapi?',
      options1: [
        { id: 'good', label: '😊 Nzuri', value: 'good' },
        { id: 'okay', label: '😐 Wastani', value: 'okay' },
        { id: 'unwell', label: '😟 Sikujisikii vizuri', value: 'unwell' },
      ],
      options2: [
        { id: 'head', label: '🤕 Kichwa', value: 'head' },
        { id: 'stomach', label: '🤢 Tumbo', value: 'stomach' },
        { id: 'fever', label: '🤒 Homa', value: 'fever' },
        { id: 'cough', label: '😷 Kikohozi', value: 'cough' },
      ],
      result: {
        title: 'Umefanikiwa!',
        message: 'AfyaAI iko tayari kukusaidia.',
        advice: 'Ushauri wa AI:',
        adviceGood: 'Endelea kufuata afya njema! Nywa maji ya kutosha na lala vizuri.',
        adviceOkay: 'Angalia dalili zako. Wasiliana na daktari ikiwa itaendelea.',
        adviceUnwell: 'Tunapendekeza uongee na daktari. Angalia dalili zako kwa karibu.',
        cta: 'Endelea kwa Dashibodi',
        disclaimer: '⚠️ AI inasaidia, sio badala ya daktari',
      },
    },
    chw: {
      title: 'Sajili mgonjwa wa kwanza',
      subtitle: 'Jaza taarifa za msingi',
      question1: 'Jina la mgonjwa?',
      question2: 'Umri?',
      result: {
        title: 'Umefanikiwa!',
        message: 'Mgonjwa amesajiliwa. AI imeshaanza uchambuzi.',
        suggestion: 'Mapendekezo ya AI:',
        cta: 'Endelea kwa Dashibodi',
      },
    },
    clinician: {
      title: 'Angalia muhtasari wa AI',
      subtitle: 'AI imeshaona wagonjwa 5 walio na hatari',
      result: {
        title: 'Umefanikiwa!',
        message: 'Unaweza kupitia mapendekezo ya AI.',
        cta: 'Endelea kwa Dashibodi',
        override: 'Unaweza kubadilisha uamuzi wa AI wakati wowote',
      },
    },
  },
  en: {
    patient: {
      title: "Let's try together!",
      subtitle: 'Answer 2 quick questions',
      question1: 'How are you feeling today?',
      question2: 'Where does it hurt?',
      options1: [
        { id: 'good', label: '😊 Good', value: 'good' },
        { id: 'okay', label: '😐 Okay', value: 'okay' },
        { id: 'unwell', label: "😟 Don't feel well", value: 'unwell' },
      ],
      options2: [
        { id: 'head', label: '🤕 Head', value: 'head' },
        { id: 'stomach', label: '🤢 Stomach', value: 'stomach' },
        { id: 'fever', label: '🤒 Fever', value: 'fever' },
        { id: 'cough', label: '😷 Cough', value: 'cough' },
      ],
      result: {
        title: 'Well done!',
        message: 'AfyaAI is ready to help you.',
        advice: 'AI Advice:',
        adviceGood: 'Keep up the good health! Drink plenty of water and get good sleep.',
        adviceOkay: 'Monitor your symptoms. Contact a doctor if it continues.',
        adviceUnwell: 'We recommend talking to a doctor. Monitor your symptoms closely.',
        cta: 'Continue to Dashboard',
        disclaimer: '⚠️ AI assists, not replaces doctors',
      },
    },
    chw: {
      title: 'Register first patient',
      subtitle: 'Fill in basic information',
      question1: 'Patient name?',
      question2: 'Age?',
      result: {
        title: 'Success!',
        message: 'Patient registered. AI has started analysis.',
        suggestion: 'AI Suggestions:',
        cta: 'Continue to Dashboard',
      },
    },
    clinician: {
      title: 'View AI triage summary',
      subtitle: 'AI has identified 5 high-risk patients',
      result: {
        title: 'Success!',
        message: 'You can review AI recommendations.',
        cta: 'Continue to Dashboard',
        override: 'You can override AI decisions anytime',
      },
    },
  },
};

export function FirstAhaMoment({ language, role, onComplete }: FirstAhaMomentProps) {
  const [step, setStep] = useState(1);
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [showResult, setShowResult] = useState(false);
  const t = translations[language][role] as any;

  const handleAnswer1 = (value: string) => {
    setAnswer1(value);
    setTimeout(() => setStep(2), 300);
  };

  const handleAnswer2 = (value: string) => {
    setAnswer2(value);
    setTimeout(() => setShowResult(true), 300);
  };

  const getAdvice = () => {
    if (role !== 'patient') return '';
    if (answer1 === 'good') return t.result.adviceGood;
    if (answer1 === 'okay') return t.result.adviceOkay;
    return t.result.adviceUnwell;
  };

  if (showResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 100%)' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
        >
          {/* Success animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"
          >
            <Sparkles className="h-12 w-12 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-3"
          >
            {t.result.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-700 mb-6"
          >
            {t.result.message}
          </motion.p>

          {/* AI Advice for patients */}
          {role === 'patient' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-6 text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-blue-900">{t.result.advice}</span>
              </div>
              <p className="text-gray-800 leading-relaxed">
                {getAdvice()}
              </p>
            </motion.div>
          )}

          {/* CHW/Clinician specific content */}
          {role !== 'patient' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 mb-6"
            >
              <p className="text-gray-800">
                {role === 'clinician' ? t.result.override : t.result.suggestion}
              </p>
            </motion.div>
          )}

          {/* Disclaimer for patients */}
          {role === 'patient' && (
            <p className="text-sm text-gray-600 mb-6">
              {t.result.disclaimer}
            </p>
          )}

          {/* CTA button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onComplete({ answer1, answer2 })}
            className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1E88E5 0%, #0F9D58 100%)' }}
          >
            <span>{t.result.cta}</span>
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Patient flow
  if (role === 'patient') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 100%)' }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-500 to-green-500 p-8 text-center text-white">
            <Search className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
            <p className="text-blue-100">{t.subtitle}</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  {t.question1}
                </h3>
                <div className="space-y-3">
                  {t.options1.map((option: any) => (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer1(option.value)}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left font-semibold text-lg"
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  {t.question2}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {t.options2.map((option: any) => (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer2(option.value)}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center font-semibold"
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // CHW/Clinician simplified flow
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 100%)' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        {role === 'chw' ? (
          <UserPlus className="h-16 w-16 mx-auto mb-6 text-green-500" />
        ) : (
          <ClipboardCheck className="h-16 w-16 mx-auto mb-6 text-blue-500" />
        )}
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {t.title}
        </h2>
        <p className="text-gray-700 mb-8">
          {t.subtitle}
        </p>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowResult(true)}
          className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1E88E5 0%, #0F9D58 100%)' }}
        >
          {language === 'sw' ? 'Simulia' : 'Simulate'}
        </motion.button>
      </motion.div>
    </div>
  );
}
