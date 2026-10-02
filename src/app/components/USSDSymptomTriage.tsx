/**
 * USSDSymptomTriage - USSD/SMS Symptom Triage Simulator
 * For feature phone users without smartphone access
 * < 6 questions, 90 second flow, facility referral code
 * 
 * System Prompt: You are an on-device/edge triage agent for Tanzania.
 * You must ask short, culturally-appropriate Kiswahili questions one at a time
 * via USSD or 160-char SMS, collect minimum required signals (age group, pregnancy,
 * main symptom), run a lightweight decision tree, compute a risk band 
 * (LOW / MEDIUM / HIGH), and return a simple recommendation (self-care, visit CHW,
 * go to clinic, call emergency). Always include a facility referral code (HFR ID)
 * and an SMS confirmation.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  MapPin,
  Clock,
  User,
  Copy,
  Send,
} from 'lucide-react';
import { Button } from './ui/button';
import { ClinicalUseNotice } from './ClinicalUseNotice';
import {
  isClinicalTriageEnabled,
  PRODUCT_HOLD_NOTICE,
} from '@/app/services/clinicalProductHold';

interface USSDSymptomTriageProps {
  language: 'sw' | 'en';
  onBack: () => void;
}

interface TriageQuestion {
  id: string;
  text: { sw: string; en: string };
  options: Array<{ value: string; label: { sw: string; en: string } }>;
}

interface TriageResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'URGENT' | 'EMERGENCY' | null;
  productHold: boolean;
  recommendation: { sw: string; en: string };
  facility: {
    name: { sw: string; en: string };
    hfrId: string;
    phone: string;
    distance: string;
  };
  chwContact?: string;
  referralCode: string;
  smsMessage: { sw: string; en: string };
}

export function USSDSymptomTriage({ language, onBack }: USSDSymptomTriageProps) {
  const [mode, setMode] = useState<'select' | 'ussd' | 'sms' | 'result'>('select');
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TriageResult | null>(null);
  const [ussdSession, setUssdSession] = useState<string[]>([]);
  const [sessionStartTime] = useState(Date.now());

  const content = {
    sw: {
      title: 'Triage ya USSD/SMS',
      subtitle: 'Kwa simu za kawaida bila mtandao wa data',
      selectMode: 'Chagua Njia',
      ussdMode: 'USSD (*123#)',
      smsMode: 'SMS (Ujumbe Mfupi)',
      howItWorks: 'Jinsi Inavyofanya Kazi',
      ussdDescription: 'Piga *123# kwenye simu yako. Fuata maelekezo ya menyu. Utapokea jibu moja kwa moja.',
      smsDescription: 'Tuma "AFYA" kwa 15015. Jibu maswali. Utapokea ushauri na nambari ya rufaa.',
      startUSSD: 'Anza USSD',
      startSMS: 'Anza SMS',
      sessionActive: 'Kipindi Kinaendelea',
      timeElapsed: 'Muda Uliopita',
      seconds: 'sekunde',
      sendResponse: 'Tuma',
      copied: 'Imenakiliwa',
      copyReferral: 'Nakili Nambari ya Rufaa',
      referralCode: 'Nambari ya Rufaa',
      riskLevel: 'Kiwango cha Hatari',
      recommendation: 'Mapendekezo',
      facility: 'Kituo cha Afya',
      distance: 'Umbali',
      chwContact: 'Wasiliana na CHW',
      emergency: 'Dharura? Piga 112',
      newSession: 'Anza Kipindi Kipya',
      riskLevels: {
        LOW: 'Chini',
        MEDIUM: 'Wastani',
        URGENT: 'Haraka',
        EMERGENCY: 'Dharura',
      },
    },
    en: {
      title: 'USSD/SMS Triage',
      subtitle: 'For basic phones without data',
      selectMode: 'Select Method',
      ussdMode: 'USSD (*123#)',
      smsMode: 'SMS (Text Message)',
      howItWorks: 'How It Works',
      ussdDescription: 'Dial *123# on your phone. Follow menu prompts. Get immediate response.',
      smsDescription: 'Send "AFYA" to 15015. Answer questions. Get advice and referral code.',
      startUSSD: 'Start USSD',
      startSMS: 'Start SMS',
      sessionActive: 'Session Active',
      timeElapsed: 'Time Elapsed',
      seconds: 'seconds',
      sendResponse: 'Send',
      copied: 'Copied',
      copyReferral: 'Copy Referral Code',
      referralCode: 'Referral Code',
      riskLevel: 'Risk Level',
      recommendation: 'Recommendation',
      facility: 'Health Facility',
      distance: 'Distance',
      chwContact: 'Contact CHW',
      emergency: 'Emergency? Call 112',
      newSession: 'Start New Session',
      riskLevels: {
        LOW: 'Low',
        MEDIUM: 'Medium',
        URGENT: 'Urgent',
        EMERGENCY: 'Emergency',
      },
    },
  };

  const t = content[language];

  // USSD/SMS Triage Flow (< 6 questions)
  const triageQuestions: TriageQuestion[] = [
    {
      id: 'age',
      text: {
        sw: 'Umri?',
        en: 'Age?',
      },
      options: [
        { value: '<5', label: { sw: '1) Chini ya miaka 5', en: '1) Under 5 years' } },
        { value: '5-17', label: { sw: '2) Miaka 5-17', en: '2) 5-17 years' } },
        { value: '18-49', label: { sw: '3) Miaka 18-49', en: '3) 18-49 years' } },
        { value: '50+', label: { sw: '4) Zaidi ya miaka 50', en: '4) 50+ years' } },
      ],
    },
    {
      id: 'pregnancy',
      text: {
        sw: 'Je, una mimba?',
        en: 'Are you pregnant?',
      },
      options: [
        { value: 'yes', label: { sw: '1) Ndio', en: '1) Yes' } },
        { value: 'no', label: { sw: '2) Hapana', en: '2) No' } },
        { value: 'unsure', label: { sw: '3) Sijui', en: '3) Not sure' } },
      ],
    },
    {
      id: 'symptom',
      text: {
        sw: 'Dalili kuu?',
        en: 'Main symptom?',
      },
      options: [
        { value: 'fever', label: { sw: '1) Homa', en: '1) Fever' } },
        { value: 'cough', label: { sw: '2) Kikohozi', en: '2) Cough' } },
        { value: 'pain', label: { sw: '3) Maumivu', en: '3) Pain' } },
        { value: 'bleeding', label: { sw: '4) Kutokwa na damu', en: '4) Bleeding' } },
        { value: 'breathing', label: { sw: '5) Shida ya kupumua', en: '5) Breathing difficulty' } },
      ],
    },
    {
      id: 'duration',
      text: {
        sw: 'Muda gani?',
        en: 'How long?',
      },
      options: [
        { value: '<24h', label: { sw: '1) Chini ya siku 1', en: '1) Less than 1 day' } },
        { value: '1-3d', label: { sw: '2) Siku 1-3', en: '2) 1-3 days' } },
        { value: '4-7d', label: { sw: '3) Siku 4-7', en: '3) 4-7 days' } },
        { value: '>7d', label: { sw: '4) Zaidi ya wiki 1', en: '4) More than 1 week' } },
      ],
    },
    {
      id: 'severity',
      text: {
        sw: 'Ukali?',
        en: 'Severity?',
      },
      options: [
        { value: 'mild', label: { sw: '1) Rahisi', en: '1) Mild' } },
        { value: 'moderate', label: { sw: '2) Wastani', en: '2) Moderate' } },
        { value: 'severe', label: { sw: '3) Kali', en: '3) Severe' } },
      ],
    },
  ];

  const computeRiskAndRecommendation = (answers: Record<string, string>): TriageResult => {
    if (!isClinicalTriageEnabled()) {
      return {
        riskLevel: null,
        productHold: true,
        recommendation: { ...PRODUCT_HOLD_NOTICE },
        facility: {
          name: { sw: '', en: '' },
          hfrId: '',
          phone: '',
          distance: '',
        },
        referralCode: '',
        smsMessage: { ...PRODUCT_HOLD_NOTICE },
      };
    }

    let riskLevel: 'LOW' | 'URGENT' | 'EMERGENCY' = 'LOW';
    let recommendation = { sw: '', en: '' };
    
    // Decision tree logic
    const isPregnant = answers.pregnancy === 'yes';
    const isChild = answers.age === '<5';
    const hasEmergencySymptom = answers.symptom === 'bleeding' || answers.symptom === 'breathing';
    const isSevere = answers.severity === 'severe';
    const isLongDuration = answers.duration === '>7d';

    if (hasEmergencySymptom || (isPregnant && answers.symptom === 'bleeding')) {
      riskLevel = 'EMERGENCY';
      recommendation = {
        sw: 'Dharura. Nenda kituo cha afya sasa.',
        en: 'Emergency. Go to a facility now.',
      };
    } else if (isSevere || isPregnant || isChild || isLongDuration) {
      riskLevel = 'URGENT';
      recommendation = {
        sw: 'Haraka. Tembelea kituo cha afya ndani ya saa 24.',
        en: 'Urgent. Visit a health facility within 24 hours.',
      };
    } else {
      riskLevel = 'LOW';
      recommendation = {
        sw: 'Pumzika nyumbani. Kunywa maji mengi. Tembelea kituo kama haziendi.',
        en: 'Rest at home. Drink plenty of water. Visit facility if symptoms persist.',
      };
    }

    // Generate referral code
    const referralCode = `AFY-${Date.now().toString().slice(-6)}`;

    // Select appropriate facility based on risk
    const facility = riskLevel === 'EMERGENCY'
      ? {
          name: { sw: 'Hospitali ya Rufaa Muhimbili', en: 'Muhimbili National Hospital' },
          hfrId: 'HFR-001234',
          phone: '+255-22-215-0608',
          distance: '5.2 km',
        }
      : {
          name: { sw: 'Kituo cha Afya Kariakoo', en: 'Kariakoo Health Centre' },
          hfrId: 'HFR-005678',
          phone: '+255-22-218-4567',
          distance: '2.1 km',
        };

    // CHW contact for MEDIUM/LOW risk
    const chwContact = riskLevel === 'LOW' ? '+255-754-123-456' : undefined;

    // Generate SMS message
    const smsMessage = {
      sw: `Hatari: ${riskLevel}\n${recommendation.sw}\nKituo: ${facility.name.sw} (${facility.hfrId})\nSimu: ${facility.phone}\n${chwContact ? `CHW: ${chwContact}\n` : ''}Rufaa: ${referralCode}`,
      en: `Risk: ${riskLevel}\n${recommendation.en}\nFacility: ${facility.name.en} (${facility.hfrId})\nPhone: ${facility.phone}\n${chwContact ? `CHW: ${chwContact}\n` : ''}Ref: ${referralCode}`,
    };

    return {
      riskLevel,
      productHold: false,
      recommendation,
      facility,
      chwContact,
      referralCode,
      smsMessage,
    };
  };

  const handleOptionSelect = (value: string) => {
    const newResponses = {
      ...responses,
      [triageQuestions[currentStep].id]: value,
    };
    setResponses(newResponses);

    // Add to USSD session log
    const question = triageQuestions[currentStep];
    const option = question.options.find(o => o.value === value);
    setUssdSession(prev => [
      ...prev,
      `> ${question.text[language]}`,
      `< ${option?.label[language]}`,
    ]);

    // Check if we need pregnancy question
    if (currentStep === 0 && value === '18-49') {
      // Ask pregnancy question next
      setCurrentStep(1);
    } else if (currentStep === 0) {
      // Skip pregnancy question for non-reproductive age
      setCurrentStep(2);
    } else if (currentStep < triageQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete - compute result
      const triageResult = computeRiskAndRecommendation(newResponses);
      setResult(triageResult);
      setMode('result');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t.copied);
  };

  const getTimeElapsed = () => {
    return Math.floor((Date.now() - sessionStartTime) / 1000);
  };

  // Mode Selection
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-[#FAFBFC]">
        {!isClinicalTriageEnabled() && <ClinicalUseNotice mode="hold" />}
        {/* Header */}
        <div className="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-4 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                {language === 'sw' ? 'Rudi' : 'Back'}
              </span>
            </button>

            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-8 h-8" />
              <h1 className="text-3xl font-bold">{t.title}</h1>
            </div>
            <p className="text-white/90 text-base">{t.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <h2 className="text-2xl font-bold text-[#1A1D23] mb-4">{t.selectMode}</h2>

          {/* USSD Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#F5F3FF] rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#1A1D23] mb-2">
                  {t.ussdMode}
                </h3>
                <p className="text-[#6B7280] mb-4">{t.ussdDescription}</p>
                <div className="flex items-center gap-3 p-3 bg-[#FAFBFC] rounded-lg mb-4">
                  <div className="flex-1 font-mono text-lg text-[#1A1D23]">*123#</div>
                  <Button
                    onClick={() => setMode('ussd')}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED]"
                  >
                    {t.startUSSD}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SMS Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#1E88E5]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#1A1D23] mb-2">
                  {t.smsMode}
                </h3>
                <p className="text-[#6B7280] mb-4">{t.smsDescription}</p>
                <div className="flex items-center gap-3 p-3 bg-[#FAFBFC] rounded-lg mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-[#6B7280]">
                      {language === 'sw' ? 'Tuma kwa:' : 'Send to:'}
                    </p>
                    <p className="font-mono text-lg text-[#1A1D23]">15015</p>
                  </div>
                  <Button
                    onClick={() => setMode('sms')}
                    className="bg-[#1E88E5] hover:bg-[#1976D2]"
                  >
                    {t.startSMS}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info Card */}
          <div className="bg-[#EFF6FF] rounded-xl border border-[#DBEAFE] p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#1E88E5] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-[#1E40AF] leading-relaxed">
                  {language === 'sw'
                    ? 'Huduma hii ni bure. Inapatikana kwa simu zote bila mtandao wa data. Utapokea nambari ya rufaa kwa ajili ya kituo cha afya.'
                    : 'This service is free. Available on all phones without data. You will receive a referral code for the health facility.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // USSD Session
  if (mode === 'ussd') {
    const currentQuestion = triageQuestions[currentStep];

    return (
      <div className="min-h-screen bg-black text-[#00FF00] font-mono">
        {!isClinicalTriageEnabled() && <ClinicalUseNotice mode="hold" />}
        {/* USSD Screen Simulator */}
        <div className="max-w-md mx-auto p-4">
          {/* Status Bar */}
          <div className="text-center py-2 border-b border-[#00FF00]/30 mb-4">
            <p className="text-sm">*123# - {t.sessionActive}</p>
            <p className="text-xs opacity-70">
              {t.timeElapsed}: {getTimeElapsed()}s
            </p>
          </div>

          {/* Session Log */}
          <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {ussdSession.map((line, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: line.startsWith('>') ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={line.startsWith('>') ? 'text-[#00FF00]' : 'text-[#FFFF00]'}
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Current Question */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#00FF00] mt-4"
            >
              <p className="mb-2">&gt; {currentQuestion.text[language]}</p>
            </motion.div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(option.value)}
                className="w-full text-left p-3 bg-[#00FF00]/10 hover:bg-[#00FF00]/20 border border-[#00FF00]/30 rounded transition-colors"
              >
                {option.label[language]}
              </button>
            ))}
          </div>

          {/* Exit */}
          <button
            onClick={onBack}
            className="w-full mt-6 p-3 bg-red-900/50 hover:bg-red-900/70 border border-red-500/50 rounded transition-colors"
          >
            0) {language === 'sw' ? 'Toka' : 'Exit'}
          </button>
        </div>
      </div>
    );
  }

  // SMS Mode (similar to USSD but styled differently)
  if (mode === 'sms') {
    const currentQuestion = triageQuestions[currentStep];

    return (
      <div className="min-h-screen bg-[#FAFBFC]">
        {!isClinicalTriageEnabled() && <ClinicalUseNotice mode="hold" />}
        {/* SMS Interface */}
        <div className="max-w-md mx-auto p-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#1E88E5] text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">15015</p>
                  <p className="text-xs opacity-70">AfyaAI Triage</p>
                </div>
                <button onClick={onBack} className="text-white/80 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 min-h-96 max-h-96 overflow-y-auto bg-[#E5DDD5]">
              <AnimatePresence>
                {ussdSession.map((line, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${line.startsWith('>') ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        line.startsWith('>')
                          ? 'bg-[#DCF8C6] text-[#1A1D23]'
                          : 'bg-white text-[#1A1D23]'
                      }`}
                    >
                      <p className="text-sm">{line.substring(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Current Question */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[80%] p-3 rounded-lg bg-white">
                  <p className="text-sm">{currentQuestion.text[language]}</p>
                  <div className="mt-2 space-y-1">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(option.value)}
                        className="w-full text-left text-sm p-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded transition-colors"
                      >
                        {option.label[language]}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'result' && result?.productHold) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] pb-8">
        <ClinicalUseNotice mode="hold" />
      </div>
    );
  }

  // Result Screen
  if (mode === 'result' && result && result.riskLevel) {
    const riskColors = {
      LOW: { bg: '#ECFDF5', text: '#10B981', border: '#A7F3D0' },
      MEDIUM: { bg: '#FFFBEB', text: '#F59E0B', border: '#FDE68A' },
      URGENT: { bg: '#FFF7ED', text: '#C2410C', border: '#FDBA74' },
      EMERGENCY: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
    };
    const colors = riskColors[result.riskLevel];

    return (
      <div className="min-h-screen bg-[#FAFBFC] pb-8">
        <ClinicalUseNotice mode="unvalidated" />
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <h1 className="text-2xl font-bold text-[#1A1D23]">
              {language === 'sw' ? 'Matokeo ya Tathmini' : 'Triage Result'}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {t.timeElapsed}: {getTimeElapsed()}s
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
          {/* Risk Level */}
          <div
            className="rounded-2xl border-2 p-6"
            style={{ backgroundColor: colors.bg, borderColor: colors.border }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              {t.riskLevel}
            </p>
            <h2 className="text-4xl font-bold" style={{ color: colors.text }}>
              {t.riskLevels[result.riskLevel]}
            </h2>
          </div>

          {/* Recommendation */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="text-lg font-semibold text-[#1A1D23] mb-3">
              {t.recommendation}
            </h3>
            <p className="text-base text-[#1A1D23] leading-relaxed">
              {result.recommendation[language]}
            </p>
          </div>

          {/* Facility Info */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="text-lg font-semibold text-[#1A1D23] mb-4">
              {t.facility}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1E88E5] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-medium text-[#1A1D23]">
                    {result.facility.name[language]}
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    {result.facility.hfrId} • {result.facility.distance}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#1E88E5]" />
                <a
                  href={`tel:${result.facility.phone}`}
                  className="text-base text-[#1E88E5] hover:underline"
                >
                  {result.facility.phone}
                </a>
              </div>
            </div>
          </div>

          {/* CHW Contact */}
          {result.chwContact && (
            <div className="bg-[#EFF6FF] rounded-xl border border-[#DBEAFE] p-6">
              <h3 className="text-base font-semibold text-[#1A1D23] mb-3">
                {t.chwContact}
              </h3>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#1E88E5]" />
                <a
                  href={`tel:${result.chwContact}`}
                  className="text-base text-[#1E88E5] hover:underline"
                >
                  {result.chwContact}
                </a>
              </div>
            </div>
          )}

          {/* Referral Code */}
          <div className="bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-[#1A1D23]">
                {t.referralCode}
              </h3>
              <button
                onClick={() => copyToClipboard(result.referralCode)}
                className="flex items-center gap-2 text-[#1E88E5] hover:text-[#1976D2]"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">{t.copyReferral}</span>
              </button>
            </div>
            <p className="font-mono text-2xl font-bold text-[#1A1D23]">
              {result.referralCode}
            </p>
          </div>

          {/* SMS Message Preview */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-[#1E88E5]" />
              <h3 className="text-base font-semibold text-[#1A1D23]">
                {language === 'sw' ? 'Ujumbe Umetumiwa' : 'SMS Sent'}
              </h3>
            </div>
            <div className="p-4 bg-[#FAFBFC] rounded-lg font-mono text-sm text-[#1A1D23] whitespace-pre-line">
              {result.smsMessage[language]}
            </div>
          </div>

          {/* Emergency Notice */}
          {result.riskLevel === 'EMERGENCY' && (
            <div className="bg-[#FEF2F2] rounded-xl border border-[#FEE2E2] p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-[#EF4444] flex-shrink-0" />
                <div>
                  <p className="text-base font-semibold text-[#991B1B] mb-1">
                    {t.emergency}
                  </p>
                  <p className="text-sm text-[#991B1B]">
                    {language === 'sw'
                      ? 'Kwa dharura, piga simu 112 mara moja.'
                      : 'For emergencies, call 112 immediately.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                setMode('select');
                setCurrentStep(0);
                setResponses({});
                setResult(null);
                setUssdSession([]);
              }}
              className="w-full h-12 bg-[#1E88E5] hover:bg-[#1976D2]"
            >
              {t.newSession}
            </Button>
            <Button onClick={onBack} variant="outline" className="w-full h-12">
              {language === 'sw' ? 'Rudi' : 'Back'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
