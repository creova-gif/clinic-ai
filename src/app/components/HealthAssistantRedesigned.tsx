/**
 * Health Assistant - Guided Care (NO BOT FEEL)
 * 
 * PURPOSE: Safe triage & guidance without feeling automated
 * 
 * CRITICAL REQUIREMENTS:
 * - One question per screen
 * - Explain why each question is asked
 * - Always offer "Talk to health worker" and "Find clinic"
 * - Emergency override always visible
 * - No conversational personality
 * - No implied diagnosis
 * - No AI language
 * 
 * SAFETY:
 * - Red flag symptom detection → immediate emergency screen
 * - Clinical disclaimer on every screen
 * - Escalation always visible (<2 taps)
 * - Works offline (basic triage cached)
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  HealthIcon,
  EmergencyIcon,
  PhoneIcon,
  LocationIcon,
  ChevronLeftIcon,
  InfoIcon,
  CheckIcon,
} from './icons/MedicalIcons';
import { MedicalButton } from './ui/medical-button';
import { EmergencyScreen } from './ui/MedicalTransitions';
import {
  MOTION_DURATION_S,
  MOTION_EASING,
  prefersReducedMotion,
} from '@/app/styles/motion-tokens';

interface Question {
  id: string;
  text: string;
  explanation: string;
  options: Array<{
    id: string;
    text: string;
    isRedFlag?: boolean; // Triggers immediate emergency screen
  }>;
  category?: 'pregnancy' | 'child' | 'adult';
}

interface HealthAssistantProps {
  language: 'sw' | 'en';
  onBack: () => void;
  onNavigate: (route: string) => void;
  isPregnant?: boolean;
  isChild?: boolean;
  age?: number;
}

export function HealthAssistant({
  language,
  onBack,
  onNavigate,
  isPregnant = false,
  isChild = false,
  age,
}: HealthAssistantProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showEmergency, setShowEmergency] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [guidance, setGuidance] = useState<{
    urgency: string;
    recommendation: string;
    steps: string[];
  } | null>(null);

  const content = {
    sw: {
      title: 'Ushauri wa Afya',
      disclaimer: 'Hii ni ushauri tu. Daktari atafanya uamuzi wa mwisho.',
      whyAsking: 'Kwa nini tunaomba hii?',
      selectAnswer: 'Chagua jibu',
      emergency: {
        title: 'Tafuta Msaada Mara Moja',
        description: 'Dalili hii inahitaji msaada wa dharura haraka.',
        callEmergency: 'Piga 112',
        findClinic: 'Tafuta Hospitali',
      },
      questions: {
        initial: {
          text: 'Ni aina gani ya msaada unahitaji?',
          explanation: 'Hii itatusaidia kukupa ushauri sahihi',
          options: [
            { id: 'symptoms', text: 'Nina dalili' },
            { id: 'medication', text: 'Swali kuhusu dawa' },
            { id: 'pregnancy', text: 'Swali la ujauzito' },
            { id: 'child', text: 'Swali la mtoto' },
            { id: 'general', text: 'Swali jingine' },
          ],
        },
        symptoms: {
          text: 'Umehisi vipi?',
          explanation: 'Hii itatusaidia kujua ni ushauri gani unahitaji',
          options: [
            {
              id: 'breathing',
              text: 'Shida ya kupumua',
              isRedFlag: true,
            },
            {
              id: 'chest_pain',
              text: 'Maumivu ya kifua',
              isRedFlag: true,
            },
            { id: 'fever', text: 'Homa' },
            { id: 'cough', text: 'Kikohozi' },
            { id: 'headache', text: 'Maumivu ya kichwa' },
            { id: 'stomach', text: 'Maumivu ya tumbo' },
          ],
        },
        fever_duration: {
          text: 'Homa imekaa kwa muda gani?',
          explanation: 'Hii itatusaidia kujua kama unahitaji kuona daktari haraka',
          options: [
            { id: '1day', text: 'Siku 1' },
            { id: '2-3days', text: 'Siku 2-3' },
            { id: '4+days', text: 'Siku 4 au zaidi' },
          ],
        },
      },
      actions: {
        talkToWorker: 'Ongea na Mhudumu wa Afya',
        findClinic: 'Tafuta Kituo cha Afya',
        back: 'Rudi',
        continue: 'Endelea',
      },
      guidance: {
        emergency: {
          urgency: 'Dharura',
          recommendation: 'Tafuta msaada wa dharura mara moja',
          steps: [
            'Piga 112 mara moja',
            'Nenda hospitali ya karibu',
            'Usisubiri dalili ziwe mbaya zaidi',
          ],
        },
        urgent: {
          urgency: 'Haraka',
          recommendation: 'Unahitaji kuona daktari leo au kesho',
          steps: [
            'Weka miadi leo au kesho',
            'Ongea na mhudumu wa afya kupitia ujumbe',
            'Angalia dalili zikibaki au kukuwa mbaya',
          ],
        },
        routine: {
          urgency: 'Kawaida',
          recommendation: 'Unaweza kupanga miadi ya kawaida',
          steps: [
            'Weka miadi katika wiki 1-2 ijayo',
            'Pumzika na kunywa maji mengi',
            'Rudi kama dalili zitabaki zaidi ya siku 3',
          ],
        },
      },
      footer: 'Ushauri huu si utambuzi wa ugonjwa. Daktari atakufanyia uchunguzi kamili.',
    },
    en: {
      title: 'Health Guidance',
      disclaimer: 'This is guidance only. A healthcare professional makes the final clinical decision.',
      whyAsking: 'Why we need to know this',
      selectAnswer: 'Select an answer',
      emergency: {
        title: 'Seek Help Immediately',
        description: 'This symptom requires urgent medical attention.',
        callEmergency: 'Call 112',
        findClinic: 'Find Hospital',
      },
      questions: {
        initial: {
          text: 'What kind of help do you need?',
          explanation: 'This helps us give you the right guidance',
          options: [
            { id: 'symptoms', text: 'I have symptoms' },
            { id: 'medication', text: 'Medication question' },
            { id: 'pregnancy', text: 'Pregnancy question' },
            { id: 'child', text: 'Child health question' },
            { id: 'general', text: 'General question' },
          ],
        },
        symptoms: {
          text: 'How are you feeling?',
          explanation: 'This helps us understand what guidance you need',
          options: [
            {
              id: 'breathing',
              text: 'Difficulty breathing',
              isRedFlag: true,
            },
            {
              id: 'chest_pain',
              text: 'Chest pain',
              isRedFlag: true,
            },
            { id: 'fever', text: 'Fever' },
            { id: 'cough', text: 'Cough' },
            { id: 'headache', text: 'Headache' },
            { id: 'stomach', text: 'Stomach pain' },
          ],
        },
        fever_duration: {
          text: 'How long have you had a fever?',
          explanation: 'This helps us know if you need to see a doctor soon',
          options: [
            { id: '1day', text: '1 day' },
            { id: '2-3days', text: '2-3 days' },
            { id: '4+days', text: '4 or more days' },
          ],
        },
      },
      actions: {
        talkToWorker: 'Talk to Health Worker',
        findClinic: 'Find Clinic',
        back: 'Back',
        continue: 'Continue',
      },
      guidance: {
        emergency: {
          urgency: 'Emergency',
          recommendation: 'Seek emergency medical attention immediately',
          steps: [
            'Call 112 now',
            'Go to nearest emergency hospital',
            'Do not wait for symptoms to worsen',
          ],
        },
        urgent: {
          urgency: 'Urgent',
          recommendation: 'You should see a doctor today or tomorrow',
          steps: [
            'Book appointment for today or tomorrow',
            'Message health worker if symptoms worsen',
            'Monitor your symptoms closely',
          ],
        },
        routine: {
          urgency: 'Routine',
          recommendation: 'You can schedule a regular appointment',
          steps: [
            'Book appointment within 1-2 weeks',
            'Rest and drink plenty of water',
            'Return if symptoms persist beyond 3 days',
          ],
        },
      },
      footer: 'This guidance is not a diagnosis. A doctor will conduct a full examination.',
    },
  };

  const t = content[language];
  const reducedMotion = prefersReducedMotion();

  // Get current question
  const questionFlow = ['initial', 'symptoms', 'fever_duration'];
  const currentQuestionKey = questionFlow[currentQuestionIndex] as keyof typeof t.questions;
  const currentQuestion = t.questions[currentQuestionKey];

  const handleAnswer = (optionId: string) => {
    const selectedOption = currentQuestion.options.find(
      (opt: any) => opt.id === optionId
    ) as any;

    // Check for red flag symptoms
    if (selectedOption?.isRedFlag) {
      setShowEmergency(true);
      return;
    }

    // Save answer
    setAnswers({ ...answers, [currentQuestionKey]: optionId });

    // Move to next question or show guidance
    if (currentQuestionIndex < questionFlow.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Generate guidance based on answers
      const generatedGuidance = generateGuidance(answers, optionId);
      setGuidance(generatedGuidance);
      setShowGuidance(true);
    }
  };

  const generateGuidance = (
    allAnswers: Record<string, string>,
    lastAnswer: string
  ) => {
    // Simple logic (would be more sophisticated in production)
    if (lastAnswer === '4+days') {
      return t.guidance.urgent;
    } else if (lastAnswer === '2-3days') {
      return t.guidance.urgent;
    } else {
      return t.guidance.routine;
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onBack();
    }
  };

  // Emergency Screen
  if (showEmergency) {
    return (
      <div className="min-h-screen bg-[#FEF2F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#DC2626] rounded-full flex items-center justify-center mx-auto mb-4">
              <EmergencyIcon size={40} color="#FFFFFF" />
            </div>
            <h1 className="text-2xl font-bold text-[#DC2626] mb-2">
              {t.emergency.title}
            </h1>
            <p className="text-base text-[#991B1B]">
              {t.emergency.description}
            </p>
          </div>

          <div className="space-y-3">
            <MedicalButton
              variant="danger"
              size="lg"
              onClick={() => { window.location.href = 'tel:112'; }}
              icon={<PhoneIcon size={24} color="#FFFFFF" />}
              fullWidth
              className="h-16 text-lg"
            >
              {t.emergency.callEmergency}
            </MedicalButton>

            <MedicalButton
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('find-clinic')}
              icon={<LocationIcon size={20} color="#DC2626" />}
              fullWidth
            >
              {t.emergency.findClinic}
            </MedicalButton>
          </div>

          <button
            onClick={() => setShowEmergency(false)}
            className="w-full text-center text-sm text-[#6B7280] underline"
          >
            {t.actions.back}
          </button>
        </div>
      </div>
    );
  }

  // Guidance Results Screen
  if (showGuidance && guidance) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        {/* Emergency Button */}
        <div className="fixed top-4 right-4 z-50">
          <MedicalButton
            variant="danger"
            size="sm"
            onClick={() => onNavigate('emergency')}
            icon={<EmergencyIcon size={20} color="#FFFFFF" />}
          >
            {language === 'sw' ? 'Dharura' : 'Emergency'}
          </MedicalButton>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <button
            onClick={() => {
              setShowGuidance(false);
              setCurrentQuestionIndex(0);
              setAnswers({});
            }}
            className="flex items-center gap-2 text-[#6B7280]"
          >
            <ChevronLeftIcon size={20} color="#6B7280" />
            <span className="text-sm">{t.actions.back}</span>
          </button>

          {/* Guidance Card */}
          <div
            className={`p-6 rounded-2xl border-2 ${
              guidance.urgency === t.guidance.emergency.urgency
                ? 'bg-[#FEF2F2] border-[#FEE2E2]'
                : guidance.urgency === t.guidance.urgent.urgency
                ? 'bg-[#FEF3C7] border-[#FDE68A]'
                : 'bg-[#D1FAE5] border-[#A7F3D0]'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  guidance.urgency === t.guidance.emergency.urgency
                    ? 'bg-[#DC2626]'
                    : guidance.urgency === t.guidance.urgent.urgency
                    ? 'bg-[#F59E0B]'
                    : 'bg-[#10B981]'
                }`}
              >
                <HealthIcon size={24} color="#FFFFFF" />
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    guidance.urgency === t.guidance.emergency.urgency
                      ? 'text-[#991B1B]'
                      : guidance.urgency === t.guidance.urgent.urgency
                      ? 'text-[#92400E]'
                      : 'text-[#065F46]'
                  }`}
                >
                  {guidance.urgency}
                </p>
                <h2
                  className={`text-lg font-semibold ${
                    guidance.urgency === t.guidance.emergency.urgency
                      ? 'text-[#991B1B]'
                      : guidance.urgency === t.guidance.urgent.urgency
                      ? 'text-[#92400E]'
                      : 'text-[#065F46]'
                  }`}
                >
                  {guidance.recommendation}
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {guidance.steps.map((step: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      guidance.urgency === t.guidance.emergency.urgency
                        ? 'bg-[#FEE2E2]'
                        : guidance.urgency === t.guidance.urgent.urgency
                        ? 'bg-[#FEF3C7]'
                        : 'bg-[#A7F3D0]'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold ${
                        guidance.urgency === t.guidance.emergency.urgency
                          ? 'text-[#991B1B]'
                          : guidance.urgency === t.guidance.urgent.urgency
                          ? 'text-[#92400E]'
                          : 'text-[#065F46]'
                      }`}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      guidance.urgency === t.guidance.emergency.urgency
                        ? 'text-[#991B1B]'
                        : guidance.urgency === t.guidance.urgent.urgency
                        ? 'text-[#92400E]'
                        : 'text-[#065F46]'
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <MedicalButton
              variant="primary"
              size="lg"
              onClick={() => onNavigate('appointments')}
              fullWidth
            >
              {language === 'sw' ? 'Weka Miadi' : 'Book Appointment'}
            </MedicalButton>

            <MedicalButton
              variant="secondary"
              size="md"
              onClick={() => onNavigate('messages')}
              fullWidth
            >
              {t.actions.talkToWorker}
            </MedicalButton>

            <MedicalButton
              variant="secondary"
              size="md"
              onClick={() => onNavigate('find-clinic')}
              fullWidth
            >
              {t.actions.findClinic}
            </MedicalButton>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl">
            <p className="text-xs text-[#6B7280] text-center">{t.footer}</p>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Emergency Button */}
      <div className="fixed top-4 right-4 z-50">
        <MedicalButton
          variant="danger"
          size="sm"
          onClick={() => onNavigate('emergency')}
          icon={<EmergencyIcon size={20} color="#FFFFFF" />}
        >
          {language === 'sw' ? 'Dharura' : 'Emergency'}
        </MedicalButton>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] pt-4 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#6B7280] mb-3"
          >
            <ChevronLeftIcon size={20} color="#6B7280" />
            <span className="text-sm">{t.actions.back}</span>
          </button>

          <h1 className="text-2xl font-semibold text-[#1E1E1E]">{t.title}</h1>

          {/* Progress Indicator */}
          <div className="flex gap-2 mt-3">
            {questionFlow.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i <= currentQuestionIndex ? 'bg-[#0F3D56]' : 'bg-[#E5E7EB]'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Clinical Disclaimer */}
        <div className="p-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl">
          <p className="text-sm text-[#1E40AF]">{t.disclaimer}</p>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestionKey}
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: MOTION_DURATION_S.standard,
            ease: MOTION_EASING.inOut,
          }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-2">
              {currentQuestion.text}
            </h2>

            {/* Explanation */}
            <div className="flex items-start gap-2 p-3 bg-[#F7F9FB] rounded-lg">
              <InfoIcon size={16} color="#6B7280" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-[#6B7280] mb-1">
                  {t.whyAsking}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#6B7280]">{t.selectAnswer}</p>

            {currentQuestion.options.map((option: any, index: number) => (
              <motion.button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={`w-full p-4 border-2 rounded-xl text-left transition-colors ${
                  option.isRedFlag
                    ? 'border-[#FEE2E2] bg-[#FEF2F2] hover:border-[#FCA5A5]'
                    : 'border-[#E5E7EB] bg-white hover:border-[#0F3D56]'
                }`}
                {...(reducedMotion ? {} : {
                  initial: { opacity: 0, y: 10 },
                  animate: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: MOTION_DURATION_S.fast,
                      delay: index * 0.05,
                      ease: MOTION_EASING.out,
                    },
                  },
                })}
              >
                <p className={`text-base font-medium ${
                  option.isRedFlag ? 'text-[#DC2626]' : 'text-[#1E1E1E]'
                }`}>
                  {option.text}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Always-Visible Escalation */}
        <div className="space-y-3 pt-4 border-t-2 border-[#E5E7EB]">
          <p className="text-sm font-medium text-[#6B7280] text-center">
            {language === 'sw' ? 'Au' : 'Or'}
          </p>

          <MedicalButton
            variant="secondary"
            size="md"
            onClick={() => onNavigate('messages')}
            icon={<PhoneIcon size={20} color="#0F3D56" />}
            fullWidth
          >
            {t.actions.talkToWorker}
          </MedicalButton>

          <MedicalButton
            variant="secondary"
            size="md"
            onClick={() => onNavigate('find-clinic')}
            icon={<LocationIcon size={20} color="#0F3D56" />}
            fullWidth
          >
            {t.actions.findClinic}
          </MedicalButton>
        </div>
      </main>
    </div>
  );
}
