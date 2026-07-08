/**
 * CREOVA Health OS - AI Triage Flow
 * 
 * Multi-step triage interface optimized for tablets
 * Used by nurses and CHWs in busy clinics
 * 
 * Features:
 * - 5-step flow: Complaint → Vitals → Symptoms → Risk Factors → Summary
 * - Large touch targets
 * - Quick-select chips
 * - AI risk scoring
 * - <2 minute completion time
 * - Swahili/English
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = {
  primary: '#0F3D56',
  teal: '#1B998B',
  tealLight: '#E8F5F3',
  red: '#DC2626',
  redLight: '#FEE2E2',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  green: '#059669',
  greenLight: '#D1FAE5',
  blue: '#2563EB',
  blueLight: '#DBEAFE',
  neutral50: '#F9FAFB',
  neutral100: '#F3F4F6',
  neutral200: '#E5E7EB',
  neutral400: '#9CA3AF',
  neutral600: '#4B5563',
  neutral700: '#374151',
  neutral900: '#111827',
  white: '#FFFFFF',
};

const STEPS = [
  { id: 1, label: 'Chief Complaint', labelSw: 'Malalamiko Makuu', icon: '💬' },
  { id: 2, label: 'Vitals', labelSw: 'Dalili Muhimu', icon: '🩺' },
  { id: 3, label: 'Symptoms', labelSw: 'Dalili', icon: '🤒' },
  { id: 4, label: 'Risk Factors', labelSw: 'Hatari', icon: '⚠️' },
  { id: 5, label: 'Summary & Triage', labelSw: 'Muhtasari', icon: '📊' },
];

const COMPLAINTS = {
  en: [
    { id: 'fever', label: 'Fever', icon: '🤒' },
    { id: 'cough', label: 'Cough', icon: '😷' },
    { id: 'abdominal', label: 'Abdominal pain', icon: '🤢' },
    { id: 'injury', label: 'Injury/Trauma', icon: '🩹' },
    { id: 'pregnancy', label: 'Pregnancy-related', icon: '🤰' },
    { id: 'chest_pain', label: 'Chest pain', icon: '💔' },
    { id: 'headache', label: 'Headache', icon: '🧠' },
    { id: 'breathing', label: 'Difficulty breathing', icon: '😮‍💨' },
  ],
  sw: [
    { id: 'fever', label: 'Homa', icon: '🤒' },
    { id: 'cough', label: 'Kikohozi', icon: '😷' },
    { id: 'abdominal', label: 'Maumivu ya tumbo', icon: '🤢' },
    { id: 'injury', label: 'Jeraha', icon: '🩹' },
    { id: 'pregnancy', label: 'Kuhusiana na ujauzito', icon: '🤰' },
    { id: 'chest_pain', label: 'Maumivu ya kifua', icon: '💔' },
    { id: 'headache', label: 'Maumivu ya kichwa', icon: '🧠' },
    { id: 'breathing', label: 'Shida ya kupumua', icon: '😮‍💨' },
  ],
};

const SYMPTOMS = {
  en: [
    'Vomiting', 'Diarrhea', 'Body aches', 'Nausea', 'Dizziness', 'Fatigue',
    'Rash', 'Swelling', 'Bleeding', 'Confusion', 'Blurred vision', 'Loss of appetite',
  ],
  sw: [
    'Kutapika', 'Kuhara', 'Maumivu ya mwili', 'Kichefuchefu', 'Kizunguzungu', 'Uchovu',
    'Upele', 'Kuvimba', 'Damu kutoka', 'Kuchanganyikiwa', 'Kuona vibaya', 'Kukosa hamu ya kula',
  ],
};

const RISK_FACTORS = {
  en: [
    'Pregnant', 'Diabetes', 'Hypertension', 'HIV+', 'TB history', 'Heart disease',
    'Asthma', 'Recent surgery', 'Smoker', 'Alcohol use',
  ],
  sw: [
    'Mjamzito', 'Kisukari', 'Shinikizo la damu', 'VVU+', 'Historia ya kifua kikuu', 'Ugonjwa wa moyo',
    'Pumu', 'Upasuaji wa hivi karibuni', 'Mvuta sigara', 'Matumizi ya pombe',
  ],
};

function Stepper({ currentStep, language }: { currentStep: number; language: 'en' | 'sw' }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '24px 40px',
      background: COLORS.white,
      borderBottom: `1px solid ${COLORS.neutral200}`,
    }}>
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* Circle */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: isCompleted ? COLORS.green : isActive ? COLORS.teal : COLORS.neutral200,
                color: COLORS.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 8,
                transition: 'all 0.3s',
              }}>
                {isCompleted ? '✓' : step.icon}
              </div>

              {/* Label */}
              <span style={{
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? COLORS.teal : COLORS.neutral600,
                textAlign: 'center',
              }}>
                {language === 'en' ? step.label : step.labelSw}
              </span>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: isCompleted ? COLORS.green : COLORS.neutral200,
                marginTop: -32,
                marginLeft: -8,
                marginRight: -8,
                transition: 'all 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChipButton({
  label,
  selected,
  onClick,
  icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 20px',
        background: selected ? COLORS.teal : COLORS.white,
        color: selected ? COLORS.white : COLORS.neutral900,
        border: `2px solid ${selected ? COLORS.teal : COLORS.neutral200}`,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 64,
      }}
    >
      {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
      {label}
    </button>
  );
}

export default function TriageFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  // Form data
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [vitals, setVitals] = useState({ bp: '', hr: '', temp: '', spo2: '' });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);

  // AI Triage Result (mock)
  const [triageResult, setTriageResult] = useState({
    category: 'Urgent',
    categorySw: 'Dharura',
    severity: 'high' as 'high' | 'medium' | 'low',
    reasoning: 'Elevated blood pressure (165/110) with headache and blurred vision in pregnant patient suggests severe pre-eclampsia.',
    reasoningSw: 'Shinikizo la damu la juu (165/110) na maumivu ya kichwa na kuona vibaya kwa mjamzito inaonyesha pre-eclampsia kali.',
    action: 'Immediate doctor consultation required. Do not delay.',
    actionSw: 'Consultation ya daktari inahitajika mara moja. Usicheleweshe.',
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    alert('Triage completed! Patient added to queue.');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: COLORS.neutral50,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        height: 64,
        background: COLORS.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
      }}>
        <div>
          <h1 style={{ margin: 0, color: COLORS.white, fontSize: 20, fontWeight: 600 }}>CREOVA Triage</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            {language === 'en' ? 'AI-Powered Patient Assessment' : 'Tathmini ya Mgonjwa na AI'}
          </p>
        </div>

        <button
          onClick={() => setLanguage(lang => lang === 'en' ? 'sw' : 'en')}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8,
            color: COLORS.white,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {language === 'en' ? '🇬🇧 English' : '🇹🇿 Kiswahili'}
        </button>
      </div>

      {/* Stepper */}
      <Stepper currentStep={currentStep} language={language} />

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 40 }}>
        <AnimatePresence mode="wait">
          {/* Step 1: Complaint */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: COLORS.neutral900 }}>
                {language === 'en' ? 'What is the main complaint?' : 'Malalamiko makuu ni nini?'}
              </h2>
              <p style={{ margin: '0 0 32px', fontSize: 14, color: COLORS.neutral600 }}>
                {language === 'en' ? 'Select one or more' : 'Chagua moja au zaidi'}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16,
                maxWidth: 1000,
              }}>
                {COMPLAINTS[language].map(complaint => (
                  <ChipButton
                    key={complaint.id}
                    label={complaint.label}
                    icon={complaint.icon}
                    selected={selectedComplaints.includes(complaint.id)}
                    onClick={() => {
                      setSelectedComplaints(prev =>
                        prev.includes(complaint.id)
                          ? prev.filter(c => c !== complaint.id)
                          : [...prev, complaint.id]
                      );
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Vitals */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: COLORS.neutral900 }}>
                {language === 'en' ? 'Record vital signs' : 'Rekodi dalili muhimu'}
              </h2>
              <p style={{ margin: '0 0 32px', fontSize: 14, color: COLORS.neutral600 }}>
                {language === 'en' ? 'Enter measurements' : 'Ingiza vipimo'}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 24,
                maxWidth: 800,
              }}>
                {[
                  { key: 'bp', label: 'Blood Pressure', labelSw: 'Shinikizo la Damu', placeholder: '120/80', unit: 'mmHg' },
                  { key: 'hr', label: 'Heart Rate', labelSw: 'Mapigo ya Moyo', placeholder: '72', unit: 'bpm' },
                  { key: 'temp', label: 'Temperature', labelSw: 'Joto la Mwili', placeholder: '37.0', unit: '°C' },
                  { key: 'spo2', label: 'Oxygen Saturation', labelSw: 'Oksijeni', placeholder: '98', unit: '%' },
                ].map(vital => (
                  <div key={vital.key}>
                    <label style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.neutral900,
                    }}>
                      {language === 'en' ? vital.label : vital.labelSw}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder={vital.placeholder}
                        value={vitals[vital.key as keyof typeof vitals]}
                        onChange={(e) => setVitals({ ...vitals, [vital.key]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '16px 80px 16px 16px',
                          fontSize: 18,
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          border: `2px solid ${COLORS.neutral200}`,
                          borderRadius: 8,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 14,
                        color: COLORS.neutral600,
                        fontWeight: 500,
                      }}>
                        {vital.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Symptoms */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: COLORS.neutral900 }}>
                {language === 'en' ? 'What other symptoms?' : 'Dalili zingine ni zipi?'}
              </h2>
              <p style={{ margin: '0 0 32px', fontSize: 14, color: COLORS.neutral600 }}>
                {language === 'en' ? 'Select all that apply' : 'Chagua zote zinazohusika'}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 12,
                maxWidth: 1000,
              }}>
                {SYMPTOMS[language].map((symptom, i) => (
                  <ChipButton
                    key={i}
                    label={symptom}
                    selected={selectedSymptoms.includes(symptom)}
                    onClick={() => {
                      setSelectedSymptoms(prev =>
                        prev.includes(symptom)
                          ? prev.filter(s => s !== symptom)
                          : [...prev, symptom]
                      );
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Risk Factors */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: COLORS.neutral900 }}>
                {language === 'en' ? 'Any risk factors or conditions?' : 'Je, kuna hatari au hali yoyote?'}
              </h2>
              <p style={{ margin: '0 0 32px', fontSize: 14, color: COLORS.neutral600 }}>
                {language === 'en' ? 'Select all that apply' : 'Chagua zote zinazohusika'}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 12,
                maxWidth: 1000,
              }}>
                {RISK_FACTORS[language].map((risk, i) => (
                  <ChipButton
                    key={i}
                    label={risk}
                    selected={selectedRisks.includes(risk)}
                    onClick={() => {
                      setSelectedRisks(prev =>
                        prev.includes(risk)
                          ? prev.filter(r => r !== risk)
                          : [...prev, risk]
                      );
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: Summary & Triage */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ margin: '0 0 32px', fontSize: 24, fontWeight: 600, color: COLORS.neutral900 }}>
                {language === 'en' ? 'Triage Summary' : 'Muhtasari wa Triage'}
              </h2>

              {/* Triage Category */}
              <div style={{
                padding: 24,
                background: triageResult.severity === 'high' ? COLORS.redLight : triageResult.severity === 'medium' ? COLORS.amberLight : COLORS.greenLight,
                border: `3px solid ${triageResult.severity === 'high' ? COLORS.red : triageResult.severity === 'medium' ? COLORS.amber : COLORS.green}`,
                borderRadius: 12,
                marginBottom: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: triageResult.severity === 'high' ? COLORS.red : triageResult.severity === 'medium' ? COLORS.amber : COLORS.green,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                  }}>
                    {triageResult.severity === 'high' ? '🚨' : triageResult.severity === 'medium' ? '⚠️' : '✓'}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 700, color: triageResult.severity === 'high' ? COLORS.red : triageResult.severity === 'medium' ? '#92400E' : COLORS.green }}>
                      {language === 'en' ? triageResult.category : triageResult.categorySw}
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, color: COLORS.neutral700, fontWeight: 500 }}>
                      {language === 'en' ? triageResult.action : triageResult.actionSw}
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: 16,
                  background: COLORS.white,
                  borderRadius: 8,
                }}>
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.neutral700 }}>
                    <strong>{language === 'en' ? 'AI Reasoning:' : 'AI Sababu:'}</strong> {language === 'en' ? triageResult.reasoning : triageResult.reasoningSw}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div style={{
                background: COLORS.white,
                border: `1px solid ${COLORS.neutral200}`,
                borderRadius: 12,
                padding: 24,
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: COLORS.neutral900 }}>
                  {language === 'en' ? 'Assessment Summary' : 'Muhtasari wa Tathmini'}
                </h3>

                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                      {language === 'en' ? 'Chief Complaints' : 'Malalamiko Makuu'}
                    </p>
                    <p style={{ margin: 0, fontSize: 14, color: COLORS.neutral900 }}>
                      {selectedComplaints.join(', ') || (language === 'en' ? 'None selected' : 'Hakuna')}
                    </p>
                  </div>

                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                      {language === 'en' ? 'Vitals' : 'Dalili Muhimu'}
                    </p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {vitals.bp && <span>BP: {vitals.bp}</span>}
                      {vitals.hr && <span>HR: {vitals.hr}</span>}
                      {vitals.temp && <span>Temp: {vitals.temp}°C</span>}
                      {vitals.spo2 && <span>SpO₂: {vitals.spo2}%</span>}
                    </div>
                  </div>

                  {selectedSymptoms.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                        {language === 'en' ? 'Symptoms' : 'Dalili'}
                      </p>
                      <p style={{ margin: 0, fontSize: 14, color: COLORS.neutral900 }}>
                        {selectedSymptoms.join(', ')}
                      </p>
                    </div>
                  )}

                  {selectedRisks.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                        {language === 'en' ? 'Risk Factors' : 'Hatari'}
                      </p>
                      <p style={{ margin: 0, fontSize: 14, color: COLORS.neutral900 }}>
                        {selectedRisks.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{
        padding: '20px 40px',
        background: COLORS.white,
        borderTop: `1px solid ${COLORS.neutral200}`,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          style={{
            padding: '14px 32px',
            background: currentStep === 1 ? COLORS.neutral100 : COLORS.white,
            color: currentStep === 1 ? COLORS.neutral400 : COLORS.neutral900,
            border: `2px solid ${COLORS.neutral200}`,
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          ← {language === 'en' ? 'Back' : 'Rudi'}
        </button>

        <button
          onClick={currentStep === 5 ? handleFinish : handleNext}
          style={{
            padding: '14px 40px',
            background: COLORS.teal,
            color: COLORS.white,
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {currentStep === 5
            ? (language === 'en' ? 'Add to Queue' : 'Ongeza kwenye Foleni')
            : (language === 'en' ? 'Next' : 'Endelea')} →
        </button>
      </div>
    </div>
  );
}
