/**
 * ModernOnboarding - Conversational, Progressive, Lightweight
 * Designed as a guided conversation, not a form
 * Max 3-5 screens, explains why data is needed, allows skipping
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Globe, Heart, Baby, Activity, MessageCircle, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

interface OnboardingData {
  language: 'sw' | 'en';
  name?: string;
  primaryGoal?: 'symptoms' | 'maternal' | 'chronic' | 'general';
  consentGiven: boolean;
}

interface ModernOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export function ModernOnboarding({ onComplete }: ModernOnboardingProps) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<'sw' | 'en'>('sw');
  const [name, setName] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState<string>('');
  const [consentGiven, setConsentGiven] = useState(false);

  const content = {
    sw: {
      welcome: {
        title: 'Karibu AfyaAI',
        subtitle: 'Msaidizi wako wa afya unaaminika',
        description: 'Tutakusaidia kupata huduma za afya kwa urahisi, salama na kwa lugha yako.',
        cta: 'Anza Safari',
      },
      name: {
        title: 'Tunakujua vipi?',
        subtitle: 'Tupe jina la kukuita ili tuwasiliane vizuri',
        placeholder: 'Jina lako (la kwanza tu)',
        skip: 'Ruka',
        next: 'Endelea',
        why: 'Hii inafanya huduma yako kuwa ya kibinafsi zaidi',
      },
      goal: {
        title: 'Tunaweza kukusaidiaje leo?',
        subtitle: 'Chagua lengo lako kuu (unaweza kubadilisha baadaye)',
        options: {
          symptoms: {
            title: 'Tathmini Dalili',
            description: 'Nina dalili na nataka maelekezo',
          },
          maternal: {
            title: 'Huduma ya Mama na Mtoto',
            description: 'Mimba, uzazi, au afya ya mtoto',
          },
          chronic: {
            title: 'Usimamizi wa Hali',
            description: 'Kudhibiti kisukari, BP, au magonjwa mengine',
          },
          general: {
            title: 'Afya ya Jumla',
            description: 'Nataka kuwa na afya nzuri',
          },
        },
        skip: 'Sitaamua sasa',
      },
      privacy: {
        title: 'Taarifa zako ni salama',
        subtitle: 'Kabla ya kuanza, hebu tufahamishe jinsi tunavyolinda faragha yako',
        points: [
          {
            icon: <Shield className="w-5 h-5" />,
            title: 'Usimbaji wa Kiwango cha Serikali',
            description: 'Taarifa zako zimehifadhiwa kwa njia salama zaidi',
          },
          {
            icon: <CheckCircle2 className="w-5 h-5" />,
            title: 'Unathibiti Data Yako',
            description: 'Unaweza kuangalia, kubadilisha au kufuta taarifa yako wakati wowote',
          },
          {
            icon: <Heart className="w-5 h-5" />,
            title: 'AI Inasaidia, Sio Kubadilisha',
            description: 'Madaktari wa binadamu ndio wanaofanya maamuzi ya mwisho',
          },
        ],
        checkbox: 'Ninaelewa na nakubali masharti',
        cta: 'Anza Kutumia AfyaAI',
      },
    },
    en: {
      welcome: {
        title: 'Welcome to AfyaAI',
        subtitle: 'Your trusted healthcare companion',
        description: 'We\'ll help you access healthcare easily, safely, and in your language.',
        cta: 'Start Journey',
      },
      name: {
        title: 'How should we address you?',
        subtitle: 'Share your name so we can personalize your experience',
        placeholder: 'Your first name',
        skip: 'Skip',
        next: 'Continue',
        why: 'This makes your care more personal',
      },
      goal: {
        title: 'How can we help you today?',
        subtitle: 'Choose your primary goal (you can change this later)',
        options: {
          symptoms: {
            title: 'Check Symptoms',
            description: 'I have symptoms and need guidance',
          },
          maternal: {
            title: 'Maternal & Child Care',
            description: 'Pregnancy, birth, or child health',
          },
          chronic: {
            title: 'Condition Management',
            description: 'Managing diabetes, BP, or other conditions',
          },
          general: {
            title: 'General Wellness',
            description: 'I want to stay healthy',
          },
        },
        skip: 'I\'ll decide later',
      },
      privacy: {
        title: 'Your information is safe',
        subtitle: 'Before we start, let\'s explain how we protect your privacy',
        points: [
          {
            icon: <Shield className="w-5 h-5" />,
            title: 'Government-Grade Encryption',
            description: 'Your data is protected with the highest security standards',
          },
          {
            icon: <CheckCircle2 className="w-5 h-5" />,
            title: 'You Control Your Data',
            description: 'You can view, edit, or delete your information anytime',
          },
          {
            icon: <Heart className="w-5 h-5" />,
            title: 'AI Assists, Not Replaces',
            description: 'Human clinicians make all final healthcare decisions',
          },
        ],
        checkbox: 'I understand and agree to the terms',
        cta: 'Start Using AfyaAI',
      },
    },
  };

  const t = content[language];

  const handleComplete = () => {
    onComplete({
      language,
      name: name || undefined,
      primaryGoal: primaryGoal as any || undefined,
      consentGiven,
    });
  };

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F9FF] flex flex-col">
      {/* Language toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <Globe className="w-4 h-4 text-[#1E88E5]" />
          <span className="text-sm font-medium text-[#1A1D23]">
            {language === 'sw' ? 'English' : 'Kiswahili'}
          </span>
        </button>
      </div>

      {/* Progress indicator */}
      <div className="pt-6 px-6">
        <div className="flex gap-2 max-w-md mx-auto">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-[#1E88E5]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="welcome"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <WelcomeStep
                  content={t.welcome}
                  onContinue={() => setStep(1)}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="name"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <NameStep
                  content={t.name}
                  value={name}
                  onChange={setName}
                  onContinue={() => setStep(2)}
                  onSkip={() => setStep(2)}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="goal"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <GoalStep
                  content={t.goal}
                  selected={primaryGoal}
                  onSelect={(goal: string) => {
                    setPrimaryGoal(goal);
                    setTimeout(() => setStep(3), 300);
                  }}
                  onSkip={() => setStep(3)}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="privacy"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <PrivacyStep
                  content={t.privacy}
                  consentGiven={consentGiven}
                  onConsentChange={setConsentGiven}
                  onComplete={handleComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ content, onContinue }: any) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 mx-auto bg-gradient-to-br from-[#1E88E5] to-[#43A047] rounded-full flex items-center justify-center"
      >
        <Heart className="w-10 h-10 text-white fill-white" />
      </motion.div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-[#1A1D23]">{content.title}</h1>
        <p className="text-lg text-[#6B7280]">{content.subtitle}</p>
        <p className="text-base text-[#9CA3AF] leading-relaxed pt-2">
          {content.description}
        </p>
      </div>

      <Button
        onClick={onContinue}
        className="w-full h-14 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-xl text-lg font-medium shadow-lg"
      >
        {content.cta}
        <ChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}

function NameStep({ content, value, onChange, onContinue, onSkip }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#1A1D23]">{content.title}</h2>
        <p className="text-base text-[#6B7280]">{content.subtitle}</p>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={content.placeholder}
          className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-xl text-base focus:border-[#1E88E5] focus:outline-none transition-colors"
          autoFocus
        />
        <p className="text-sm text-[#9CA3AF] flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {content.why}
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onSkip}
          variant="outline"
          className="flex-1 h-14 rounded-xl text-base"
        >
          {content.skip}
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 h-14 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-xl text-base"
        >
          {content.next}
        </Button>
      </div>
    </div>
  );
}

function GoalStep({ content, selected, onSelect, onSkip }: any) {
  const goals = [
    { key: 'symptoms', icon: Activity, color: '#1E88E5' },
    { key: 'maternal', icon: Baby, color: '#43A047' },
    { key: 'chronic', icon: Heart, color: '#FFB300' },
    { key: 'general', icon: MessageCircle, color: '#9CA3AF' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#1A1D23]">{content.title}</h2>
        <p className="text-base text-[#6B7280]">{content.subtitle}</p>
      </div>

      <div className="space-y-3">
        {goals.map(({ key, icon: Icon, color }) => (
          <motion.button
            key={key}
            onClick={() => onSelect(key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-4 bg-white border-2 rounded-xl text-left transition-all ${
              selected === key
                ? 'border-[#1E88E5] shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1A1D23] mb-1">
                  {content.options[key].title}
                </h3>
                <p className="text-sm text-[#6B7280]">
                  {content.options[key].description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <Button
        onClick={onSkip}
        variant="ghost"
        className="w-full h-12 text-[#6B7280]"
      >
        {content.skip}
      </Button>
    </div>
  );
}

function PrivacyStep({ content, consentGiven, onConsentChange, onComplete }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#1A1D23]">{content.title}</h2>
        <p className="text-base text-[#6B7280]">{content.subtitle}</p>
      </div>

      <div className="space-y-4">
        {content.points.map((point: any, index: number) => (
          <div key={index} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-[#EFF6FF] rounded-lg flex items-center justify-center flex-shrink-0 text-[#1E88E5]">
              {point.icon}
            </div>
            <div>
              <h3 className="font-semibold text-[#1A1D23] mb-1">{point.title}</h3>
              <p className="text-sm text-[#6B7280]">{point.description}</p>
            </div>
          </div>
        ))}
      </div>

      <label className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl cursor-pointer">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
        />
        <span className="text-sm text-[#1A1D23] flex-1">{content.checkbox}</span>
      </label>

      <Button
        onClick={onComplete}
        disabled={!consentGiven}
        className="w-full h-14 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-xl text-lg font-medium shadow-lg disabled:opacity-50"
      >
        {content.cta}
        <ChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}