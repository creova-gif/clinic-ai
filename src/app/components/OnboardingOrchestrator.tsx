import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Wifi, Heart, Users, Stethoscope, BarChart3, ChevronRight, Globe } from 'lucide-react';
import { WelcomeCarousel } from '@/app/components/WelcomeCarousel';
import { AccountCreationScreen } from '@/app/components/AccountCreationScreen';
import { PersonalizationScreen } from '@/app/components/PersonalizationScreen';
import { InteractiveTutorial } from '@/app/components/InteractiveTutorial';
import { FirstActionScreen } from '@/app/components/FirstActionScreen';
import { EmployeeOnboarding } from '@/app/components/EmployeeOnboarding';
import { WearableSync } from '@/app/components/WearableSync';
import { AIAssistantChat } from '@/app/components/AIAssistantChat';

export type UserType = 'patient' | 'employee' | null;
export type OnboardingStep =
  | 'splash'
  | 'language'
  | 'userType'
  | 'welcome'
  | 'account'
  | 'personalization'
  | 'tutorial'
  | 'wearable'
  | 'firstAction'
  | 'employeeOnboarding'
  | 'complete';

export interface OnboardingData {
  userType: UserType;
  language: 'sw' | 'en';
  accountData?: {
    phone: string;
    email?: string;
    biometricEnabled: boolean;
    consented: boolean;
  };
  personalizationData?: {
    goals: string[];
    concerns: string[];
    conditions: string[];
    tracking: string[];
  };
  wearableData?: {
    device?: string;
    synced: boolean;
  };
  firstActionData?: {
    actionType: string;
    value: string;
  };
  employeeData?: {
    role: string;
    completedModules: string[];
    quizScore?: number;
  };
}

interface OnboardingOrchestratorProps {
  onComplete: (data: OnboardingData) => void;
  initialLanguage?: 'sw' | 'en';
  defaultUserType?: UserType;
}

const ROLES = [
  {
    id: 'patient' as UserType,
    icon: Heart,
    color: '#0d9488',
    bg: '#ccfbf1',
    label: { sw: 'Mgonjwa / Mwananchi', en: 'Patient / Citizen' },
    desc: { sw: 'Natafuta huduma za afya kwa ajili yangu na familia', en: 'Seeking healthcare for myself and family' },
    features: {
      sw: ['Angalia dalili za magonjwa', 'Panga miadi hospitali', 'Fuatilia dawa zako'],
      en: ['Check symptoms', 'Book appointments', 'Track medications'],
    },
  },
  {
    id: 'employee' as UserType,
    icon: Stethoscope,
    color: '#0f172a',
    bg: '#e2e8f0',
    label: { sw: 'Daktari / Muuguzi', en: 'Clinician / Nurse' },
    desc: { sw: 'Ninafanya kazi hospitali au kituo cha afya', en: 'I work at a hospital or health facility' },
    features: {
      sw: ['Angalia wagonjwa', 'Andika dawa haraka', 'Rekodi za EMR'],
      en: ['Manage patients', 'Quick prescribing', 'EMR records'],
    },
  },
];

const LANG_OPTIONS = [
  { code: 'sw' as const, label: 'Kiswahili', flag: '🇹🇿', native: 'Lugha ya kwanza' },
  { code: 'en' as const, label: 'English',   flag: '🇬🇧', native: 'Primary language' },
];

const TRUST_BADGES = [
  { icon: Shield, label: { sw: 'Salama 256-bit', en: '256-bit Secure' } },
  { icon: Wifi,   label: { sw: 'Inafanya nje ya mtandao', en: 'Works Offline' } },
  { icon: Globe,  label: { sw: 'Swahili Kwanza', en: 'Swahili-First' } },
];

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -40 },
  transition: { duration: 0.3, ease: [0.2, 0, 0, 1] as const },
};

export function OnboardingOrchestrator({
  onComplete,
  initialLanguage = 'sw',
  defaultUserType = null,
}: OnboardingOrchestratorProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('language');
  const [language, setLanguage] = useState<'sw' | 'en'>(initialLanguage);
  const [userType, setUserType] = useState<UserType>(defaultUserType);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userType: defaultUserType,
    language: initialLanguage,
  });
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMinimized, setAiMinimized] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'sw' | 'en'>(initialLanguage);

  /* ── Language Selection ── */
  if (currentStep === 'language') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 55%, #0d9488 100%)' }}>
        {/* Header brand */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="text-center mb-12"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Heart size={40} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">CREOVA</h1>
            <p className="text-sm font-semibold tracking-widest uppercase mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Medical Health OS
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.2, 0, 0, 1] }}
            className="w-full max-w-sm"
          >
            <p className="text-center text-white/80 text-base font-medium mb-6">
              Chagua lugha yako · Choose your language
            </p>

            <div className="space-y-3">
              {LANG_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{
                    background: selectedLang === lang.code
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(255,255,255,0.08)',
                    border: selectedLang === lang.code
                      ? '2px solid rgba(255,255,255,0.6)'
                      : '2px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span className="text-4xl">{lang.flag}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">{lang.label}</p>
                    <p className="text-white/60 text-sm">{lang.native}</p>
                  </div>
                  {selectedLang === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: '#0d9488' }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setLanguage(selectedLang);
                setOnboardingData({ ...onboardingData, language: selectedLang });
                setCurrentStep('userType');
              }}
              className="w-full mt-8 h-14 rounded-2xl font-bold text-[#0f172a] text-base flex items-center justify-center gap-2 shadow-xl"
              style={{ background: '#ffffff' }}
            >
              {selectedLang === 'sw' ? 'Endelea' : 'Continue'}
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-5 pb-12 px-4"
        >
          {TRUST_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label.en} className="flex flex-col items-center gap-1">
                <Icon size={16} className="text-white/50" />
                <span className="text-[10px] text-white/40 text-center leading-tight">{badge.label[selectedLang]}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    );
  }

  /* ── Role / User Type Selection ── */
  if (currentStep === 'userType') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        {/* Teal top band */}
        <div className="px-6 pt-12 pb-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 55%, #0d9488 100%)' }}>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              onClick={() => setCurrentStep('language')}
              className="text-white/70 text-sm flex items-center gap-1 mb-6 hover:text-white transition-colors"
            >
              ← {language === 'sw' ? 'Rudi' : 'Back'}
            </button>
            <h1 className="text-2xl font-black text-white">
              {language === 'sw' ? 'Wewe ni nani?' : 'Who are you?'}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {language === 'sw'
                ? 'Chagua jukumu lako ili tubinafsishe uzoefu wako'
                : 'Select your role to personalise your experience'}
            </p>
          </motion.div>
        </div>

        <div className="flex-1 px-4 pt-5 pb-10 space-y-4">
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setUserType(role.id);
                  setOnboardingData({ ...onboardingData, userType: role.id, language });
                  if (role.id === 'employee') {
                    setCurrentStep('employeeOnboarding');
                  } else {
                    setCurrentStep('welcome');
                  }
                }}
                className="w-full text-left bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-2 border-transparent hover:border-[#0d9488] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: role.bg }}
                  >
                    <Icon size={28} style={{ color: role.color }} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[#0f172a] font-bold text-base">{role.label[language]}</h3>
                      <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                    </div>
                    <p className="text-gray-500 text-sm mt-0.5">{role.desc[language]}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {role.features[language].map((f) => (
                        <span
                          key={f}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: role.bg, color: role.color }}
                        >
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}

          {/* Offline / trust note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#ccfbf1]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ccfbf1] flex items-center justify-center flex-shrink-0">
              <Wifi size={20} className="text-[#0d9488]" />
            </div>
            <div>
              <p className="text-[#0f172a] font-semibold text-sm">
                {language === 'sw' ? 'Inafanya bila mtandao' : 'Works without internet'}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {language === 'sw'
                  ? 'Data yako inafanya kazi hata bila mtandao'
                  : 'Your data works even without a connection'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#ccfbf1]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ccfbf1] flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-[#0d9488]" />
            </div>
            <div>
              <p className="text-[#0f172a] font-semibold text-sm">
                {language === 'sw' ? 'Faragha yako inalindwa' : 'Your privacy is protected'}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {language === 'sw'
                  ? 'Encrypted na salama — data yako inabaki kwako'
                  : 'Encrypted and secure — your data stays yours'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Patient Onboarding Flow ── */
  if (userType === 'patient') {
    switch (currentStep) {
      case 'welcome':
        return (
          <>
            <WelcomeCarousel
              language={language}
              onComplete={() => setCurrentStep('account')}
            />
            {showAIAssistant && (
              <AIAssistantChat
                language={language}
                onClose={() => setShowAIAssistant(false)}
                minimized={aiMinimized}
                onMinimize={() => setAiMinimized(!aiMinimized)}
              />
            )}
          </>
        );

      case 'account':
        return (
          <>
            <AccountCreationScreen
              language={language}
              onComplete={(accountData) => {
                setOnboardingData({ ...onboardingData, accountData });
                setCurrentStep('personalization');
                setShowAIAssistant(true);
              }}
            />
            {showAIAssistant && (
              <AIAssistantChat
                language={language}
                onClose={() => setShowAIAssistant(false)}
                minimized={aiMinimized}
                onMinimize={() => setAiMinimized(!aiMinimized)}
              />
            )}
          </>
        );

      case 'personalization':
        return (
          <>
            <PersonalizationScreen
              language={language}
              onComplete={(personalizationData) => {
                setOnboardingData({ ...onboardingData, personalizationData });
                setCurrentStep('wearable');
              }}
            />
            {showAIAssistant && (
              <AIAssistantChat
                language={language}
                onClose={() => setShowAIAssistant(false)}
                minimized={aiMinimized}
                onMinimize={() => setAiMinimized(!aiMinimized)}
              />
            )}
          </>
        );

      case 'wearable':
        return (
          <>
            <WearableSync
              language={language}
              onComplete={(wearableData) => {
                setOnboardingData({ ...onboardingData, wearableData });
                setCurrentStep('tutorial');
              }}
            />
            {showAIAssistant && (
              <AIAssistantChat
                language={language}
                onClose={() => setShowAIAssistant(false)}
                minimized={aiMinimized}
                onMinimize={() => setAiMinimized(!aiMinimized)}
              />
            )}
          </>
        );

      case 'tutorial':
        return (
          <>
            <InteractiveTutorial
              language={language}
              onComplete={() => setCurrentStep('firstAction')}
            />
            {showAIAssistant && (
              <AIAssistantChat
                language={language}
                onClose={() => setShowAIAssistant(false)}
                minimized={aiMinimized}
                onMinimize={() => setAiMinimized(!aiMinimized)}
              />
            )}
          </>
        );

      case 'firstAction':
        return (
          <>
            <FirstActionScreen
              language={language}
              onComplete={(firstActionData) => {
                const finalData = { ...onboardingData, firstActionData };
                setOnboardingData(finalData);
                onComplete(finalData);
              }}
            />
            {showAIAssistant && (
              <AIAssistantChat
                language={language}
                onClose={() => setShowAIAssistant(false)}
                minimized={aiMinimized}
                onMinimize={() => setAiMinimized(!aiMinimized)}
              />
            )}
          </>
        );

      default:
        return null;
    }
  }

  /* ── Employee / Clinician Onboarding Flow ── */
  if (userType === 'employee') {
    return (
      <>
        <EmployeeOnboarding
          language={language}
          onComplete={(employeeData) => {
            const finalData = { ...onboardingData, employeeData };
            setOnboardingData(finalData);
            onComplete(finalData);
          }}
        />
        {showAIAssistant && (
          <AIAssistantChat
            language={language}
            onClose={() => setShowAIAssistant(false)}
            minimized={aiMinimized}
            onMinimize={() => setAiMinimized(!aiMinimized)}
          />
        )}
      </>
    );
  }

  return null;
}
