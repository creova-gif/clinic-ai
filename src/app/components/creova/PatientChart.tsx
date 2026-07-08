/**
 * CREOVA Health OS - Patient Chart (EMR-lite)
 * 
 * World-class patient chart for small clinics in Tanzania
 * Epic/Cerner-level density with cleaner UX
 * 
 * Features:
 * - Fixed patient header with allergies & chronic conditions
 * - Tabbed interface (Summary, Visits, Labs, Medications, Billing, Files)
 * - AI assistant panel (differentials, red flags, guidelines)
 * - Fast workflows (<3 seconds to understand patient)
 * - Swahili/English bilingual
 */

import { useState } from 'react';
// Motion import removed - not used in this component

const COLORS = {
  primary: '#0F3D56',
  teal: '#1B998B',
  tealLight: '#E8F5F3',
  tealMid: '#0D7A6E',
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
  neutral300: '#D1D5DB',
  neutral400: '#9CA3AF',
  neutral500: '#6B7280',
  neutral600: '#4B5563',
  neutral700: '#374151',
  neutral800: '#1F2937',
  neutral900: '#111827',
  white: '#FFFFFF',
};

interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'M' | 'F' | 'O';
  photo?: string;
  phone: string;
  language: 'sw' | 'en';
  allergies: string[];
  chronicConditions: string[];
  isPregnant?: boolean;
  weeksGestation?: number;
  insuranceProvider?: string;
  insuranceNumber?: string;
  nextOfKin: string;
  nextOfKinPhone: string;
}

interface Visit {
  id: string;
  date: string;
  complaint: string;
  vitals: {
    bp?: string;
    hr?: number;
    temp?: number;
    spo2?: number;
    weight?: number;
    height?: number;
  };
  assessment: string;
  plan: string;
  provider: string;
  diagnosis: string[];
}

interface AIAssistant {
  differentials: Array<{ condition: string; probability: string; reasoning: string }>;
  redFlags: Array<{ flag: string; severity: 'high' | 'medium'; action: string }>;
  guidelines: Array<{ title: string; link: string }>;
}

const MOCK_PATIENT: Patient = {
  id: 'P-0012',
  name: 'Amina Juma',
  age: 28,
  sex: 'F',
  phone: '+255 754 123 456',
  language: 'sw',
  allergies: ['Penicillin', 'Sulfa drugs'],
  chronicConditions: ['Gestational hypertension'],
  isPregnant: true,
  weeksGestation: 32,
  insuranceProvider: 'NHIF',
  insuranceNumber: '123456789',
  nextOfKin: 'Hassan Juma',
  nextOfKinPhone: '+255 754 987 654',
};

const MOCK_VISIT: Visit = {
  id: 'V-001',
  date: new Date().toISOString(),
  complaint: 'Severe headache and blurred vision for 2 days',
  vitals: {
    bp: '165/110',
    hr: 98,
    temp: 37.2,
    spo2: 98,
    weight: 75,
  },
  assessment: 'Severe pre-eclampsia, 32 weeks gestation',
  plan: 'Admit for observation. Start methyldopa 250mg TDS. Refer to obstetrician.',
  provider: 'Dr. Kamau',
  diagnosis: ['O14.1 - Severe pre-eclampsia'],
};

const MOCK_AI: AIAssistant = {
  differentials: [
    { condition: 'Severe pre-eclampsia', probability: 'High', reasoning: 'BP 165/110 + headache + blurred vision at 32w gestation' },
    { condition: 'Gestational hypertension', probability: 'Medium', reasoning: 'Elevated BP without proteinuria (if negative)' },
    { condition: 'Migraine', probability: 'Low', reasoning: 'Less likely given BP and pregnancy context' },
  ],
  redFlags: [
    { flag: 'Severe hypertension in pregnancy (BP >160/110)', severity: 'high', action: 'Immediate obstetric consultation required' },
    { flag: 'Visual disturbances + headache', severity: 'high', action: 'Assess for eclampsia risk' },
  ],
  guidelines: [
    { title: 'WHO - Managing complications in pregnancy', link: '#' },
    { title: 'Pre-eclampsia management protocol (MoH Tanzania)', link: '#' },
  ],
};

function PatientHeader({ patient }: { patient: Patient }) {
  return (
    <div style={{
      background: COLORS.white,
      borderBottom: `1px solid ${COLORS.neutral200}`,
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Photo */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 8,
          background: COLORS.tealLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 600,
          color: COLORS.tealMid,
          flexShrink: 0,
        }}>
          {patient.name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Demographics */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: COLORS.neutral900 }}>
              {patient.name}
            </h1>
            <span style={{
              padding: '4px 10px',
              background: COLORS.blueLight,
              color: COLORS.blue,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
            }}>
              {patient.id}
            </span>
            {patient.isPregnant && (
              <span style={{
                padding: '4px 10px',
                background: '#F3E8FF',
                color: '#7C3AED',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
              }}>
                🤰 Pregnant - {patient.weeksGestation}w
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: COLORS.neutral600, marginBottom: 12 }}>
            <span><strong>Age:</strong> {patient.age}y</span>
            <span><strong>Sex:</strong> {patient.sex === 'F' ? 'Female' : patient.sex === 'M' ? 'Male' : 'Other'}</span>
            <span><strong>Phone:</strong> {patient.phone}</span>
            <span><strong>Language:</strong> {patient.language === 'sw' ? 'Kiswahili' : 'English'}</span>
          </div>

          {/* Allergies - CRITICAL */}
          {patient.allergies.length > 0 && (
            <div style={{
              padding: '8px 12px',
              background: COLORS.redLight,
              border: `2px solid ${COLORS.red}`,
              borderRadius: 6,
              marginBottom: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <strong style={{ color: COLORS.red, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  ALLERGIES:
                </strong>
                <div style={{ display: 'flex', gap: 6 }}>
                  {patient.allergies.map(allergy => (
                    <span
                      key={allergy}
                      style={{
                        padding: '3px 8px',
                        background: COLORS.white,
                        border: `1px solid ${COLORS.red}`,
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        color: COLORS.red,
                      }}
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chronic Conditions */}
          {patient.chronicConditions.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: COLORS.neutral600, fontWeight: 500 }}>Chronic:</span>
              {patient.chronicConditions.map(condition => (
                <span
                  key={condition}
                  style={{
                    padding: '3px 8px',
                    background: COLORS.amberLight,
                    border: `1px solid ${COLORS.amber}`,
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#92400E',
                  }}
                >
                  {condition}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Insurance */}
        {patient.insuranceProvider && (
          <div style={{
            padding: 12,
            background: COLORS.neutral50,
            borderRadius: 8,
            border: `1px solid ${COLORS.neutral200}`,
          }}>
            <p style={{ margin: 0, fontSize: 11, color: COLORS.neutral500, marginBottom: 4 }}>Insurance</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.neutral900 }}>{patient.insuranceProvider}</p>
            <p style={{ margin: 0, fontSize: 12, color: COLORS.neutral600 }}>{patient.insuranceNumber}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AIAssistantPanel({ ai }: { ai: AIAssistant }) {
  return (
    <div style={{
      width: 320,
      background: COLORS.neutral50,
      borderLeft: `1px solid ${COLORS.neutral200}`,
      padding: 20,
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          padding: '8px 12px',
          background: COLORS.blueLight,
          borderRadius: 6,
        }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.blue }}>AI Suggestions</h3>
        </div>
        <p style={{ margin: 0, fontSize: 11, color: COLORS.neutral600, fontStyle: 'italic' }}>
          Not a diagnosis. Always use clinical judgement.
        </p>
      </div>

      {/* Red Flags */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: COLORS.neutral700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          🚨 Red Flags
        </h4>
        {ai.redFlags.map((flag, i) => (
          <div
            key={i}
            style={{
              padding: 10,
              background: flag.severity === 'high' ? COLORS.redLight : COLORS.amberLight,
              border: `1px solid ${flag.severity === 'high' ? COLORS.red : COLORS.amber}`,
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: flag.severity === 'high' ? COLORS.red : '#92400E' }}>
              {flag.flag}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: COLORS.neutral700 }}>
              → {flag.action}
            </p>
          </div>
        ))}
      </div>

      {/* Differentials */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: COLORS.neutral700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          🔍 Possible Conditions
        </h4>
        {ai.differentials.map((diff, i) => (
          <div
            key={i}
            style={{
              padding: 10,
              background: COLORS.white,
              border: `1px solid ${COLORS.neutral200}`,
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.neutral900 }}>{diff.condition}</span>
              <span style={{
                padding: '2px 6px',
                background: diff.probability === 'High' ? COLORS.redLight : diff.probability === 'Medium' ? COLORS.amberLight : COLORS.greenLight,
                color: diff.probability === 'High' ? COLORS.red : diff.probability === 'Medium' ? '#92400E' : COLORS.green,
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
              }}>
                {diff.probability}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: COLORS.neutral600 }}>
              {diff.reasoning}
            </p>
          </div>
        ))}
      </div>

      {/* Guidelines */}
      <div>
        <h4 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: COLORS.neutral700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          📚 Guidelines
        </h4>
        {ai.guidelines.map((guide, i) => (
          <a
            key={i}
            href={guide.link}
            style={{
              display: 'block',
              padding: '8px 10px',
              background: COLORS.white,
              border: `1px solid ${COLORS.neutral200}`,
              borderRadius: 6,
              marginBottom: 6,
              fontSize: 11,
              color: COLORS.blue,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            {guide.title} →
          </a>
        ))}
      </div>
    </div>
  );
}

export default function PatientChart() {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [activeTab, setActiveTab] = useState<'summary' | 'history' | 'admin'>('summary');
  const [showAI, setShowAI] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);

  // Mock patient data
  const patient = {
    name: 'Amina Juma',
    age: 28,
    sex: 'Female',
    id: 'P-0012',
    insurance: 'NHIF-123456789',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Hypertension', 'Diabetes'],
    pregnant: true,
    gestationWeeks: 28,
  };

  const tabs: Array<{ id: 'summary' | 'history' | 'admin', label: string, labelSw: string, icon: string }> = [
    { id: 'summary', label: 'Summary', labelSw: 'Muhtasari', icon: '📋' },
    { id: 'history', label: 'History', labelSw: 'Historia', icon: '🕒' },
    { id: 'admin', label: 'Admin', labelSw: 'Utawala', icon: '⚙️' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: COLORS.neutral50,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Top Bar */}
      <div style={{
        height: 56,
        background: COLORS.primary,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ margin: 0, color: COLORS.white, fontSize: 18, fontWeight: 600 }}>CREOVA Health OS</h1>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>EMR • Clinic • Pharmacy</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(lang => lang === 'en' ? 'sw' : 'en')}
            style={{
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 6,
              color: COLORS.white,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {language === 'en' ? '🇬🇧 English' : '🇹🇿 Kiswahili'}
          </button>

          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Dr. Kamau</span>
        </div>
      </div>

      {/* Patient Header */}
      <PatientHeader patient={MOCK_PATIENT} />

      {/* Tabs */}
      <div style={{
        background: COLORS.white,
        borderBottom: `1px solid ${COLORS.neutral200}`,
        display: 'flex',
        padding: '0 24px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? `3px solid ${COLORS.teal}` : '3px solid transparent',
              color: activeTab === tab.id ? COLORS.teal : COLORS.neutral600,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            <span>{tab.icon}</span>
            {language === 'en' ? tab.label : tab.labelSw}
          </button>
        ))}
      </div>

      {/* Main Content + AI Panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {activeTab === 'summary' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Left: Current Visit */}
              <div>
                <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: COLORS.neutral900 }}>
                  Current Visit - {new Date().toLocaleDateString('en-TZ', { month: 'short', day: 'numeric', year: 'numeric' })}
                </h2>

                {/* Chief Complaint */}
                <div style={{
                  padding: 16,
                  background: COLORS.white,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.neutral200}`,
                  marginBottom: 16,
                }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                    Chief Complaint
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: COLORS.neutral900 }}>{MOCK_VISIT.complaint}</p>
                </div>

                {/* Vitals */}
                <div style={{
                  padding: 16,
                  background: COLORS.white,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.neutral200}`,
                  marginBottom: 16,
                }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                    Vitals
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'BP', value: MOCK_VISIT.vitals.bp, alert: parseInt(MOCK_VISIT.vitals.bp?.split('/')[0] || '0') > 140 },
                      { label: 'HR', value: `${MOCK_VISIT.vitals.hr} bpm`, alert: (MOCK_VISIT.vitals.hr || 0) > 100 },
                      { label: 'Temp', value: `${MOCK_VISIT.vitals.temp}°C`, alert: (MOCK_VISIT.vitals.temp || 0) > 38 },
                      { label: 'SpO₂', value: `${MOCK_VISIT.vitals.spo2}%`, alert: (MOCK_VISIT.vitals.spo2 || 100) < 95 },
                      { label: 'Weight', value: `${MOCK_VISIT.vitals.weight} kg`, alert: false },
                    ].map(vital => (
                      <div
                        key={vital.label}
                        style={{
                          padding: 10,
                          background: vital.alert ? COLORS.redLight : COLORS.neutral50,
                          border: `1px solid ${vital.alert ? COLORS.red : COLORS.neutral200}`,
                          borderRadius: 6,
                        }}
                      >
                        <p style={{ margin: '0 0 4px', fontSize: 10, color: COLORS.neutral600 }}>{vital.label}</p>
                        <p style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 700,
                          color: vital.alert ? COLORS.red : COLORS.neutral900,
                          fontFamily: 'monospace',
                        }}>
                          {vital.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assessment & Plan */}
                <div style={{
                  padding: 16,
                  background: COLORS.white,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.neutral200}`,
                }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                    Assessment
                  </h3>
                  <p style={{ margin: '0 0 16px', fontSize: 14, color: COLORS.neutral900 }}>{MOCK_VISIT.assessment}</p>

                  <h3 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                    Plan
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: COLORS.neutral900 }}>{MOCK_VISIT.plan}</p>
                </div>
              </div>

              {/* Right: Key History */}
              <div>
                <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: COLORS.neutral900 }}>
                  Key History
                </h2>

                {/* Problem List */}
                <div style={{
                  padding: 16,
                  background: COLORS.white,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.neutral200}`,
                  marginBottom: 16,
                }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                    Problem List
                  </h3>
                  {MOCK_PATIENT.chronicConditions.map(condition => (
                    <div
                      key={condition}
                      style={{
                        padding: '8px 10px',
                        background: COLORS.neutral50,
                        borderRadius: 6,
                        marginBottom: 6,
                        fontSize: 13,
                        color: COLORS.neutral900,
                      }}
                    >
                      • {condition}
                    </div>
                  ))}
                </div>

                {/* Recent Visits */}
                <div style={{
                  padding: 16,
                  background: COLORS.white,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.neutral200}`,
                }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                    Recent Visits (Last 3)
                  </h3>
                  {[
                    { date: '10 Mar 2026', summary: 'ANC visit - BP 135/85, weight 73kg' },
                    { date: '24 Feb 2026', summary: 'ANC visit - routine, normal findings' },
                  ].map((visit, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 10px',
                        background: COLORS.neutral50,
                        borderRadius: 6,
                        marginBottom: 6,
                      }}
                    >
                      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: COLORS.neutral700 }}>{visit.date}</p>
                      <p style={{ margin: 0, fontSize: 12, color: COLORS.neutral600 }}>{visit.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            position: 'fixed',
            bottom: 24,
            right: 360,
            display: 'flex',
            gap: 12,
          }}>
            {[
              { label: 'Order Labs', icon: '🧪', color: COLORS.blue },
              { label: 'Prescribe', icon: '💊', color: COLORS.teal },
              { label: 'Refer', icon: '📤', color: COLORS.amber },
              { label: 'End Visit', icon: '✓', color: COLORS.green },
            ].map(action => (
              <button
                key={action.label}
                style={{
                  padding: '12px 20px',
                  background: action.color,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Assistant Panel */}
        <AIAssistantPanel ai={MOCK_AI} />
      </div>
    </div>
  );
}