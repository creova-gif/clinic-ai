/**
 * NationalOnboarding — Premium Redesign 2026
 * Premium dark+vibrant design with animated step transitions,
 * glassmorphism cards, and smooth language toggle.
 */

import React, { useState } from 'react';
import { ChevronRight, Shield, MapPin, Heart, ArrowRight } from 'lucide-react';

interface NationalOnboardingProps {
  onComplete: (data: {
    language: 'sw' | 'en';
    name: string;
    phone: string;
    consentGiven: boolean;
  }) => void;
}

const content = {
  sw: {
    skip: 'Ruka',
    next: 'Endelea',
    done: 'Anza AfyaCare',
    steps: [
      {
        icon: Heart,
        tag: 'Karibu',
        title: 'Afya yako.\nImeshikamana.',
        body: 'Huduma za afya bora zaidi kutoka serikali ya Tanzania — mahali popote, wakati wowote.',
        cta: 'Anza Safari Yako',
      },
      {
        icon: MapPin,
        tag: 'Upatikanaji',
        title: 'Pata huduma\nMahali popote nchini.',
        body: 'Vituo vya afya 6,000+ vinapatikana kwenye AfyaCare — Dar es Salaam hadi Mtwara.',
        cta: 'Endelea',
      },
      {
        icon: Shield,
        tag: 'Faragha',
        title: 'Data yako.\nUnayo udhibiti.',
        body: 'Taarifa zako zinabaki salama kwa usimbuaji wa hali ya juu. Hii ni haki yako.',
        cta: 'Endelea',
      },
    ],
    account: {
      tag: 'Akaunti',
      title: 'Unda akaunti yako',
      body: 'Hatua moja tu kukubaliana kuanza.',
      name: 'Jina kamili',
      namePlaceholder: 'Mfano: Amina Njoki',
      phone: 'Namba ya simu',
      phonePlaceholder: '+255 7XX XXX XXX',
      consent: 'Ninakubali sera ya faragha na masharti',
      consentNote: 'Lazima ukubali ili kuendelea',
    },
  },
  en: {
    skip: 'Skip',
    next: 'Continue',
    done: 'Start AfyaCare',
    steps: [
      {
        icon: Heart,
        tag: 'Welcome',
        title: 'Your health.\nConnected.',
        body: 'World-class healthcare from the Government of Tanzania — anywhere, anytime.',
        cta: 'Start Your Journey',
      },
      {
        icon: MapPin,
        tag: 'Access',
        title: 'Care available\nanywhere in Tanzania.',
        body: '6,000+ health facilities available on AfyaCare — from Dar es Salaam to Mtwara.',
        cta: 'Continue',
      },
      {
        icon: Shield,
        tag: 'Privacy',
        title: 'Your data.\nYour control.',
        body: 'Your information stays protected with enterprise-grade encryption. It\'s your right.',
        cta: 'Continue',
      },
    ],
    account: {
      tag: 'Account',
      title: 'Create your account',
      body: 'One quick step to get started.',
      name: 'Full name',
      namePlaceholder: 'e.g. Amina Njoki',
      phone: 'Phone number',
      phonePlaceholder: '+255 7XX XXX XXX',
      consent: 'I agree to the privacy policy and terms',
      consentNote: 'You must agree to continue',
    },
  },
};

export function NationalOnboarding({ onComplete }: NationalOnboardingProps) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<'sw' | 'en'>('sw');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);

  const t = content[language];
  const totalSteps = 4; // 3 info + 1 account

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!consentGiven) {
        setShowConsentError(true);
        return;
      }
      onComplete({ language, name, phone, consentGiven });
    }
  };

  // Accent colors cycle per step
  const stepAccents = [
    { from: '#0F3D56', to: '#1B998B', icon: '#1B998B' },
    { from: '#1B3A5C', to: '#2E7D32', icon: '#4CAF50' },
    { from: '#1A237E', to: '#0F3D56', icon: '#42A5F5' },
    { from: '#0F3D56', to: '#1B998B', icon: '#1B998B' },
  ];
  const accent = stepAccents[step];

  const isInfoStep = step < 3;
  const stepData = isInfoStep ? t.steps[step] : null;
  const StepIcon = stepData?.icon ?? Shield;

  return (
    <div className="afya-onboard">
      {/* Animated gradient background */}
      <div
        className="afya-onboard__bg"
        style={{ background: `linear-gradient(145deg, ${accent.from} 0%, ${accent.to} 100%)` }}
      />

      {/* Language toggle */}
      <div className="afya-onboard__lang">
        <button
          onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
          className="afya-onboard__lang-btn"
        >
          <span className={language === 'sw' ? 'font-bold' : 'opacity-60'}>SW</span>
          <span className="mx-1 opacity-40">·</span>
          <span className={language === 'en' ? 'font-bold' : 'opacity-60'}>EN</span>
        </button>
      </div>

      {/* Progress dots */}
      <div className="afya-onboard__dots">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`afya-onboard__dot${i === step ? ' afya-onboard__dot--active' : i < step ? ' afya-onboard__dot--done' : ''}`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="afya-onboard__card">
        {isInfoStep && stepData ? (
          <div className="afya-onboard__info">
            {/* Tag */}
            <div className="afya-onboard__tag" style={{ color: accent.icon }}>
              <StepIcon className="w-3.5 h-3.5" />
              <span>{stepData.tag}</span>
            </div>

            {/* Icon */}
            <div className="afya-onboard__icon-wrap" style={{ background: `${accent.icon}15`, border: `2px solid ${accent.icon}30` }}>
              <StepIcon className="w-9 h-9" style={{ color: accent.icon }} strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h1 className="afya-onboard__title">{stepData.title}</h1>

            {/* Body */}
            <p className="afya-onboard__body">{stepData.body}</p>

            {/* CTA */}
            <button className="afya-onboard__cta" onClick={handleNext}>
              <span>{stepData.cta}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Skip link */}
            {step < 2 && (
              <button className="afya-onboard__skip" onClick={() => setStep(3)}>
                {t.skip}
              </button>
            )}
          </div>
        ) : (
          <div className="afya-onboard__form">
            {/* Tag */}
            <div className="afya-onboard__tag" style={{ color: accent.icon }}>
              <Shield className="w-3.5 h-3.5" />
              <span>{t.account.tag}</span>
            </div>

            <h1 className="afya-onboard__title">{t.account.title}</h1>
            <p className="afya-onboard__body">{t.account.body}</p>

            <div className="afya-onboard__fields">
              {/* Name */}
              <div className="afya-onboard__field">
                <label className="afya-onboard__label">{t.account.name}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.account.namePlaceholder}
                  className="afya-onboard__input"
                  autoComplete="name"
                />
              </div>

              {/* Phone */}
              <div className="afya-onboard__field">
                <label className="afya-onboard__label">{t.account.phone}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.account.phonePlaceholder}
                  className="afya-onboard__input"
                  autoComplete="tel"
                />
              </div>

              {/* Consent */}
              <label className="afya-onboard__consent">
                <div
                  className={`afya-onboard__checkbox${consentGiven ? ' afya-onboard__checkbox--checked' : ''}`}
                  onClick={() => {
                    setConsentGiven(!consentGiven);
                    setShowConsentError(false);
                  }}
                  role="checkbox"
                  aria-checked={consentGiven}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && setConsentGiven(!consentGiven)}
                >
                  {consentGiven && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="afya-onboard__consent-text">{t.account.consent}</span>
              </label>

              {showConsentError && (
                <p className="afya-onboard__error">{t.account.consentNote}</p>
              )}
            </div>

            <button
              className={`afya-onboard__cta${!name || !phone ? ' afya-onboard__cta--disabled' : ''}`}
              onClick={handleNext}
              disabled={!name || !phone}
            >
              <span>{t.done}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}