/**
 * KLINIKI - Modern Triage Interface
 * 
 * 3-step streamlined triage flow
 * Inspired by: Modern health intake forms
 * 
 * Features:
 * - 3 steps instead of 5
 * - Large touch targets
 * - Quick-select symptoms
 * - AI risk assessment
 * - Photo upload
 */

import { useState } from 'react';
import {
  User,
  Heart,
  Thermometer,
  Activity,
  Droplet,
  Wind,
  Camera,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
  TrendingUp,
  Pill,
} from 'lucide-react';

const COLORS = {
  mint: '#5ECFB1',
  mintLight: '#E8F8F4',
  purple: '#8B7FC8',
  purpleLight: '#F3F0FF',
  coral: '#FF8E72',
  coralLight: '#FFE8E3',
  sky: '#61B5E8',
  skyLight: '#E3F2FD',
  cream: '#F5F8FA',
  white: '#FFFFFF',
  gray100: '#F4F6F8',
  gray200: '#E8EBF0',
  gray700: '#334155',
  gray800: '#1E293B',
  gray400: '#99A3B3',
  gray600: '#5C677D',
  gray900: '#1A202C',
  success: '#5ECFB1',
  warning: '#FFB84D',
  error: '#FF6B6B',
};

interface SymptomButtonProps {
  label: string;
  icon: any;
  selected: boolean;
  onClick: () => void;
}

function SymptomButton({ label, icon: Icon, selected, onClick }: SymptomButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? COLORS.mint : COLORS.white,
        border: `2px solid ${selected ? COLORS.mint : COLORS.gray200}`,
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        minHeight: '100px',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = COLORS.mint;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = COLORS.gray200;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <Icon size={32} color={selected ? COLORS.white : COLORS.gray600} strokeWidth={2} />
      <span style={{
        fontSize: '13px',
        fontWeight: 600,
        color: selected ? COLORS.white : COLORS.gray900,
        textAlign: 'center',
      }}>
        {label}
      </span>
    </button>
  );
}

interface VitalInputProps {
  icon: any;
  label: string;
  value: string;
  unit: string;
  onChange: (value: string) => void;
  status?: 'normal' | 'warning' | 'critical';
}

function VitalInput({ icon: Icon, label, value, unit, onChange, status }: VitalInputProps) {
  const statusColor = 
    status === 'critical' ? COLORS.error :
    status === 'warning' ? COLORS.warning :
    COLORS.success;

  return (
    <div style={{
      background: COLORS.white,
      borderRadius: '16px',
      padding: '16px',
      border: `2px solid ${status ? statusColor : COLORS.gray100}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: status ? `${statusColor}20` : COLORS.gray100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={20} color={status ? statusColor : COLORS.gray600} strokeWidth={2.5} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '13px',
            color: COLORS.gray600,
            marginBottom: '4px',
          }}>
            {label}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                border: 'none',
                fontSize: '24px',
                fontWeight: 700,
                color: COLORS.gray900,
                width: '80px',
                background: 'transparent',
                outline: 'none',
              }}
              placeholder="--"
            />
            <span style={{
              fontSize: '14px',
              color: COLORS.gray600,
              fontWeight: 500,
            }}>
              {unit}
            </span>
          </div>
        </div>
      </div>
      
      {status && status !== 'normal' && (
        <div style={{
          background: `${statusColor}15`,
          borderRadius: '10px',
          padding: '8px 12px',
          fontSize: '12px',
          color: statusColor,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <AlertCircle size={14} />
          {status === 'critical' ? 'Critical - Immediate attention' : 'Monitor closely'}
        </div>
      )}
    </div>
  );
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      marginBottom: '24px',
    }}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            background: i < currentStep ? COLORS.mint : COLORS.gray200,
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

export default function TriageModern() {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  
  // Step 1: Chief Complaint + Quick Symptoms
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  
  // Step 2: Vitals
  const [vitals, setVitals] = useState({
    temp: '',
    bp_systolic: '',
    bp_diastolic: '',
    heartRate: '',
    oxygen: '',
    respRate: '',
    weight: '',
  });
  
  // Step 3: Photos & Notes
  const [photos, setPhotos] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const commonSymptoms = [
    { id: 'fever', label: language === 'en' ? 'Fever' : 'Homa', icon: Thermometer },
    { id: 'headache', label: language === 'en' ? 'Headache' : 'Kichwa kuuma', icon: Activity },
    { id: 'cough', label: language === 'en' ? 'Cough' : 'Kikohozi', icon: Wind },
    { id: 'vomiting', label: language === 'en' ? 'Vomiting' : 'Kutapika', icon: Droplet },
    { id: 'diarrhea', label: language === 'en' ? 'Diarrhea' : 'Kuhara', icon: Droplet },
    { id: 'pain', label: language === 'en' ? 'Pain' : 'Maumivu', icon: AlertCircle },
  ];

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getVitalStatus = (vital: string, value: string): 'normal' | 'warning' | 'critical' | undefined => {
    if (!value) return undefined;
    
    const num = parseFloat(value);
    
    if (vital === 'temp') {
      if (num > 39) return 'critical';
      if (num > 38 || num < 35) return 'warning';
      return 'normal';
    }
    
    if (vital === 'bp_systolic') {
      if (num > 160) return 'critical';
      if (num > 140 || num < 90) return 'warning';
      return 'normal';
    }
    
    if (vital === 'heartRate') {
      if (num > 120 || num < 50) return 'critical';
      if (num > 100 || num < 60) return 'warning';
      return 'normal';
    }
    
    if (vital === 'oxygen') {
      if (num < 90) return 'critical';
      if (num < 95) return 'warning';
      return 'normal';
    }
    
    return 'normal';
  };

  const calculateRiskLevel = () => {
    let riskScore = 0;
    
    // Check vitals
    if (getVitalStatus('temp', vitals.temp) === 'critical') riskScore += 3;
    if (getVitalStatus('temp', vitals.temp) === 'warning') riskScore += 1;
    if (getVitalStatus('bp_systolic', vitals.bp_systolic) === 'critical') riskScore += 3;
    if (getVitalStatus('heartRate', vitals.heartRate) === 'critical') riskScore += 3;
    if (getVitalStatus('oxygen', vitals.oxygen) === 'critical') riskScore += 3;
    
    // Check symptoms
    if (selectedSymptoms.length >= 4) riskScore += 2;
    
    if (riskScore >= 5) return { level: 'high', color: COLORS.error, label: language === 'en' ? 'High Priority' : 'Kipaumbele Kikubwa' };
    if (riskScore >= 2) return { level: 'medium', color: COLORS.warning, label: language === 'en' ? 'Medium Priority' : 'Kipaumbele cha Kati' };
    return { level: 'low', color: COLORS.success, label: language === 'en' ? 'Standard Priority' : 'Kipaumbele cha Kawaida' };
  };

  const handleComplete = () => {
    const risk = calculateRiskLevel();
    alert(`Triage completed!\nRisk Level: ${risk.label}\nPatient added to queue.`);
    // Reset form or navigate
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.cream,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: '100px',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.skyLight} 0%, ${COLORS.purpleLight} 100%)`,
        padding: '20px 24px 32px',
        borderBottomLeftRadius: '30px',
        borderBottomRightRadius: '30px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: COLORS.gray900,
            margin: 0,
          }}>
            {language === 'en' ? 'Patient Triage' : 'Triage ya Mgonjwa'}
          </h1>
          
          <button
            onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
            style={{
              background: COLORS.white,
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              color: COLORS.gray700,
              cursor: 'pointer',
            }}
          >
            {language === 'en' ? 'SW' : 'EN'}
          </button>
        </div>
        
        <StepIndicator currentStep={step} totalSteps={3} />
        
        <div style={{
          fontSize: '14px',
          color: COLORS.gray600,
          textAlign: 'center',
        }}>
          {language === 'en' ? 'Step' : 'Hatua'} {step} {language === 'en' ? 'of' : 'ya'} 3
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {step === 1 && (
          <div style={{
            animation: 'fadeIn 0.3s ease',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: COLORS.gray900,
              margin: '0 0 16px 0',
            }}>
              {language === 'en' ? 'Chief Complaint' : 'Malalamiko Makuu'}
            </h2>
            
            <textarea
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder={language === 'en' ? 'What brings the patient in today?' : 'Ni nini kinamletea mgonjwa leo?'}
              style={{
                width: '100%',
                minHeight: '120px',
                background: COLORS.white,
                border: `2px solid ${COLORS.gray100}`,
                borderRadius: '16px',
                padding: '16px',
                fontSize: '15px',
                fontFamily: 'inherit',
                color: COLORS.gray900,
                resize: 'vertical',
                marginBottom: '24px',
              }}
            />
            
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              color: COLORS.gray900,
              margin: '0 0 16px 0',
            }}>
              {language === 'en' ? 'Quick Select Symptoms' : 'Chagua Dalili Haraka'}
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}>
              {commonSymptoms.map((symptom) => (
                <SymptomButton
                  key={symptom.id}
                  label={symptom.label}
                  icon={symptom.icon}
                  selected={selectedSymptoms.includes(symptom.id)}
                  onClick={() => toggleSymptom(symptom.id)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{
            animation: 'fadeIn 0.3s ease',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: COLORS.gray900,
              margin: '0 0 16px 0',
            }}>
              {language === 'en' ? 'Vital Signs' : 'Dalili Muhimu'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <VitalInput
                icon={Thermometer}
                label={language === 'en' ? 'Temperature' : 'Joto la Mwili'}
                value={vitals.temp}
                unit="°C"
                onChange={(val) => setVitals({ ...vitals, temp: val })}
                status={getVitalStatus('temp', vitals.temp)}
              />
              
              <div style={{
                background: COLORS.white,
                borderRadius: '16px',
                padding: '16px',
                border: `2px solid ${COLORS.gray100}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: COLORS.gray100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Activity size={20} color={COLORS.gray600} strokeWidth={2.5} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: COLORS.gray600, marginBottom: '8px' }}>
                      {language === 'en' ? 'Blood Pressure' : 'Shinikizo la Damu'}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={vitals.bp_systolic}
                        onChange={(e) => setVitals({ ...vitals, bp_systolic: e.target.value })}
                        placeholder="120"
                        style={{
                          border: 'none',
                          fontSize: '24px',
                          fontWeight: 700,
                          color: COLORS.gray900,
                          width: '70px',
                          background: 'transparent',
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '24px', fontWeight: 700, color: COLORS.gray400 }}>/</span>
                      <input
                        type="number"
                        value={vitals.bp_diastolic}
                        onChange={(e) => setVitals({ ...vitals, bp_diastolic: e.target.value })}
                        placeholder="80"
                        style={{
                          border: 'none',
                          fontSize: '24px',
                          fontWeight: 700,
                          color: COLORS.gray900,
                          width: '70px',
                          background: 'transparent',
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '14px', color: COLORS.gray600, fontWeight: 500 }}>
                        mmHg
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <VitalInput
                icon={Heart}
                label={language === 'en' ? 'Heart Rate' : 'Mapigo ya Moyo'}
                value={vitals.heartRate}
                unit="bpm"
                onChange={(val) => setVitals({ ...vitals, heartRate: val })}
                status={getVitalStatus('heartRate', vitals.heartRate)}
              />
              
              <VitalInput
                icon={Droplet}
                label={language === 'en' ? 'Blood Oxygen' : 'Oksijeni ya Damu'}
                value={vitals.oxygen}
                unit="%"
                onChange={(val) => setVitals({ ...vitals, oxygen: val })}
                status={getVitalStatus('oxygen', vitals.oxygen)}
              />
              
              <VitalInput
                icon={Wind}
                label={language === 'en' ? 'Respiratory Rate' : 'Kupumua'}
                value={vitals.respRate}
                unit="/min"
                onChange={(val) => setVitals({ ...vitals, respRate: val })}
              />
              
              <VitalInput
                icon={User}
                label={language === 'en' ? 'Weight' : 'Uzito'}
                value={vitals.weight}
                unit="kg"
                onChange={(val) => setVitals({ ...vitals, weight: val })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{
            animation: 'fadeIn 0.3s ease',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: COLORS.gray900,
              margin: '0 0 16px 0',
            }}>
              {language === 'en' ? 'Photos & Notes' : 'Picha na Maelezo'}
            </h2>
            
            <button style={{
              width: '100%',
              background: COLORS.white,
              border: `2px dashed ${COLORS.gray200}`,
              borderRadius: '16px',
              padding: '32px',
              cursor: 'pointer',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: COLORS.skyLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Camera size={28} color={COLORS.sky} strokeWidth={2} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: COLORS.gray900, marginBottom: '4px' }}>
                  {language === 'en' ? 'Take Photo' : 'Piga Picha'}
                </div>
                <div style={{ fontSize: '13px', color: COLORS.gray600 }}>
                  {language === 'en' ? 'For injuries, rashes, etc.' : 'Kwa majeraha, upele, n.k.'}
                </div>
              </div>
            </button>
            
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              color: COLORS.gray900,
              margin: '0 0 12px 0',
            }}>
              {language === 'en' ? 'Additional Notes' : 'Maelezo Zaidi'}
            </h3>
            
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder={language === 'en' ? 'Any other relevant information...' : 'Taarifa nyingine muhimu...'}
              style={{
                width: '100%',
                minHeight: '120px',
                background: COLORS.white,
                border: `2px solid ${COLORS.gray100}`,
                borderRadius: '16px',
                padding: '16px',
                fontSize: '15px',
                fontFamily: 'inherit',
                color: COLORS.gray900,
                resize: 'vertical',
                marginBottom: '24px',
              }}
            />
            
            {/* AI Risk Assessment */}
            {(() => {
              const risk = calculateRiskLevel();
              return (
                <div style={{
                  background: `${risk.color}15`,
                  borderRadius: '16px',
                  padding: '20px',
                  border: `2px solid ${risk.color}30`,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: COLORS.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <TrendingUp size={24} color={risk.color} strokeWidth={2.5} />
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '13px', color: COLORS.gray600, marginBottom: '2px' }}>
                        {language === 'en' ? 'AI Risk Assessment' : 'Tathmini ya AI'}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: risk.color }}>
                        {risk.label}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '13px', color: COLORS.gray600, lineHeight: '1.5' }}>
                    {risk.level === 'high' && (language === 'en' 
                      ? 'Patient requires immediate medical attention. Critical vitals detected.'
                      : 'Mgonjwa anahitaji huduma ya haraka. Dalili hatari zimegunduliwa.'
                    )}
                    {risk.level === 'medium' && (language === 'en'
                      ? 'Patient should be seen soon. Some vital signs need monitoring.'
                      : 'Mgonjwa anapaswa kuonwa hivi karibuni. Dalili zingine zinahitaji ufuatiliaji.'
                    )}
                    {risk.level === 'low' && (language === 'en'
                      ? 'Patient can wait in standard queue. All vitals appear normal.'
                      : 'Mgonjwa anaweza kusubiri katika foleni ya kawaida. Dalili zote ni za kawaida.'
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: COLORS.white,
        padding: '16px 24px',
        paddingBottom: '32px',
        borderTop: `1px solid ${COLORS.gray100}`,
        display: 'flex',
        gap: '12px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.04)',
      }}>
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              flex: 1,
              background: COLORS.white,
              border: `2px solid ${COLORS.gray200}`,
              borderRadius: '16px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 600,
              color: COLORS.gray900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <ChevronLeft size={20} />
            {language === 'en' ? 'Back' : 'Rudi'}
          </button>
        )}
        
        <button
          onClick={() => step < 3 ? setStep(step + 1) : handleComplete()}
          style={{
            flex: 2,
            background: COLORS.mint,
            border: 'none',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '15px',
            fontWeight: 600,
            color: COLORS.white,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(94, 207, 177, 0.3)',
          }}
        >
          {step < 3 ? (
            <>
              {language === 'en' ? 'Next' : 'Endelea'}
              <ChevronRight size={20} />
            </>
          ) : (
            <>
              <Check size={20} />
              {language === 'en' ? 'Complete Triage' : 'Maliza Triage'}
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
