/**
 * KLINIKI - Modern Onboarding Experience
 * 
 * Beautiful, welcoming onboarding flow for new clinics
 * Inspired by: Modern app onboarding experiences
 * 
 * Features:
 * - 5-step guided setup
 * - Visual progress indicator
 * - Animations & transitions
 * - Skip option for power users
 * - Celebration on completion
 */

import { useState } from 'react';
import {
  Building2,
  Users,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Play,
  MapPin,
  Phone,
  Mail,
  User,
  Stethoscope,
  X,
  Rocket,
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
};

interface OnboardingStep {
  id: string;
  title: string;
  titleSw: string;
  subtitle: string;
  subtitleSw: string;
  icon: any;
  color: string;
  bgColor: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Kliniki',
    titleSw: 'Karibu Kliniki',
    subtitle: 'World-class clinic management in Swahili',
    subtitleSw: 'Mfumo wa kitaalam wa usimamizi wa kliniki',
    icon: Sparkles,
    color: COLORS.mint,
    bgColor: COLORS.mintLight,
  },
  {
    id: 'clinic',
    title: 'Setup Your Clinic',
    titleSw: 'Weka Kliniki Yako',
    subtitle: 'Tell us about your clinic',
    subtitleSw: 'Tuambie kuhusu kliniki yako',
    icon: Building2,
    color: COLORS.sky,
    bgColor: COLORS.skyLight,
  },
  {
    id: 'staff',
    title: 'Add Your Team',
    titleSw: 'Ongeza Timu Yako',
    subtitle: 'Invite doctors, nurses, and staff',
    subtitleSw: 'Waalika madaktari, wauguzi, na wafanyakazi',
    icon: Users,
    color: COLORS.purple,
    bgColor: COLORS.purpleLight,
  },
  {
    id: 'tour',
    title: 'Quick Tour',
    titleSw: 'Ziara ya Haraka',
    subtitle: 'Learn the basics in 2 minutes',
    subtitleSw: 'Jifunze msingi kwa dakika 2',
    icon: Play,
    color: COLORS.coral,
    bgColor: COLORS.coralLight,
  },
  {
    id: 'ready',
    title: "You're Ready!",
    titleSw: 'Uko Tayari!',
    subtitle: 'Start seeing patients now',
    subtitleSw: 'Anza kuona wagonjwa sasa',
    icon: Rocket,
    color: COLORS.success,
    bgColor: COLORS.mintLight,
  },
];

interface InputFieldProps {
  icon: any;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}

function InputField({ icon: Icon, label, value, onChange, placeholder, type = 'text' }: InputFieldProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: COLORS.gray600,
        marginBottom: '8px',
      }}>
        {label}
      </label>
      
      <div style={{
        position: 'relative',
      }}>
        <Icon
          size={20}
          color={COLORS.gray400}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            background: COLORS.white,
            border: `2px solid ${COLORS.gray100}`,
            borderRadius: '14px',
            padding: '14px 16px 14px 48px',
            fontSize: '15px',
            color: COLORS.gray900,
            outline: 'none',
            transition: 'border 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = COLORS.mint;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = COLORS.gray100;
          }}
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

function FeatureCard({ icon: Icon, title, description, color, bgColor }: FeatureCardProps) {
  return (
    <div style={{
      background: COLORS.white,
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${COLORS.gray100}`,
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={24} color={color} strokeWidth={2.5} />
      </div>
      
      <div>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: COLORS.gray900,
          marginBottom: '4px',
        }}>
          {title}
        </div>
        
        <div style={{
          fontSize: '13px',
          color: COLORS.gray600,
          lineHeight: '1.5',
        }}>
          {description}
        </div>
      </div>
    </div>
  );
}

interface OnboardingModernProps {
  onComplete: (data: {
    clinicName: string;
    location: string;
    phone: string;
    email: string;
    ownerName: string;
    role: string;
  }) => void;
  onSkip?: () => void;
}

export default function OnboardingModern({ onComplete, onSkip }: OnboardingModernProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Form data
  const [clinicName, setClinicName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [role, setRole] = useState('doctor');

  const step = STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setShowConfetti(true);
      setTimeout(() => {
        onComplete({
          clinicName,
          location,
          phone,
          email,
          ownerName,
          role,
        });
      }, 2000);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return clinicName && location && phone;
    }
    if (currentStep === 2) {
      return ownerName && role;
    }
    return true;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.cream,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Skip Button */}
      {!isLastStep && onSkip && (
        <button
          onClick={onSkip}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: COLORS.gray600,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 16px',
            zIndex: 100,
          }}
        >
          {language === 'en' ? 'Skip' : 'Ruka'}
        </button>
      )}

      {/* Language Toggle */}
      <button
        onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: COLORS.white,
          border: 'none',
          borderRadius: '20px',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 600,
          color: COLORS.gray700,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          zIndex: 100,
        }}
      >
        {language === 'en' ? 'SW' : 'EN'}
      </button>

      {/* Confetti Effect */}
      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 1000,
        }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: '-10px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: [COLORS.mint, COLORS.sky, COLORS.purple, COLORS.coral][i % 4],
                animation: `fall ${2 + Math.random() * 2}s linear`,
              }}
            />
          ))}
        </div>
      )}

      {/* Progress Indicator */}
      <div style={{
        background: COLORS.white,
        padding: '20px 24px',
        borderBottom: `1px solid ${COLORS.gray100}`,
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: i <= currentStep ? step.color : COLORS.gray200,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '12px',
          fontSize: '13px',
          color: COLORS.gray600,
        }}>
          {language === 'en' ? 'Step' : 'Hatua'} {currentStep + 1} {language === 'en' ? 'of' : 'ya'} {STEPS.length}
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 24px 120px',
        animation: 'fadeIn 0.4s ease',
      }}>
        {/* Step Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: step.bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          animation: 'scaleIn 0.5s ease',
        }}>
          <step.icon size={40} color={step.color} strokeWidth={2.5} />
        </div>

        {/* Step Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: COLORS.gray900,
          textAlign: 'center',
          margin: '0 0 12px 0',
        }}>
          {language === 'en' ? step.title : step.titleSw}
        </h1>

        <p style={{
          fontSize: '15px',
          color: COLORS.gray600,
          textAlign: 'center',
          margin: '0 0 40px 0',
          lineHeight: '1.5',
        }}>
          {language === 'en' ? step.subtitle : step.subtitleSw}
        </p>

        {/* Step Content */}
        {currentStep === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <FeatureCard
              icon={Sparkles}
              title={language === 'en' ? '5 Hours Saved Daily' : 'Hifadhi Masaa 5 Kila Siku'}
              description={language === 'en' 
                ? 'Quick templates and smart workflows reduce paperwork by 70%'
                : 'Violezo vya haraka na mtiririko mahiri kupunguza kazi za karatasi kwa 70%'
              }
              color={COLORS.mint}
              bgColor={COLORS.mintLight}
            />
            
            <FeatureCard
              icon={Users}
              title={language === 'en' ? 'Bilingual by Design' : 'Lugha Mbili kwa Muundo'}
              description={language === 'en'
                ? 'Seamlessly switch between English and Kiswahili'
                : 'Badilisha kati ya Kiingereza na Kiswahili bila matatizo'
              }
              color={COLORS.sky}
              bgColor={COLORS.skyLight}
            />
            
            <FeatureCard
              icon={Stethoscope}
              title={language === 'en' ? 'World-Class Quality' : 'Ubora wa Kimataifa'}
              description={language === 'en'
                ? 'Epic/Cerner-level features at a fraction of the cost'
                : 'Vipengele vya kiwango cha Epic/Cerner kwa gharama ndogo'
              }
              color={COLORS.purple}
              bgColor={COLORS.purpleLight}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <InputField
              icon={Building2}
              label={language === 'en' ? 'Clinic Name' : 'Jina la Kliniki'}
              value={clinicName}
              onChange={setClinicName}
              placeholder={language === 'en' ? 'e.g., Amani Health Clinic' : 'mfano, Kliniki ya Afya Amani'}
            />
            
            <InputField
              icon={MapPin}
              label={language === 'en' ? 'Location' : 'Mahali'}
              value={location}
              onChange={setLocation}
              placeholder={language === 'en' ? 'e.g., Dar es Salaam, Tanzania' : 'mfano, Dar es Salaam, Tanzania'}
            />
            
            <InputField
              icon={Phone}
              label={language === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
              value={phone}
              onChange={setPhone}
              placeholder="+255 712 345 678"
              type="tel"
            />
            
            <InputField
              icon={Mail}
              label={language === 'en' ? 'Email (Optional)' : 'Barua Pepe (Si Lazima)'}
              value={email}
              onChange={setEmail}
              placeholder="clinic@example.com"
              type="email"
            />
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <InputField
              icon={User}
              label={language === 'en' ? 'Your Name' : 'Jina Lako'}
              value={ownerName}
              onChange={setOwnerName}
              placeholder={language === 'en' ? 'e.g., Dr. Amina Hassan' : 'mfano, Dkt. Amina Hassan'}
            />
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: COLORS.gray600,
                marginBottom: '12px',
              }}>
                {language === 'en' ? 'Your Role' : 'Nafasi Yako'}
              </label>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}>
                {[
                  { id: 'doctor', label: language === 'en' ? 'Doctor' : 'Daktari', icon: Stethoscope },
                  { id: 'nurse', label: language === 'en' ? 'Nurse' : 'Muuguzi', icon: Users },
                  { id: 'pharmacist', label: language === 'en' ? 'Pharmacist' : 'Mfamasia', icon: Building2 },
                  { id: 'admin', label: language === 'en' ? 'Admin' : 'Msimamizi', icon: User },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    style={{
                      background: role === r.id ? COLORS.mint : COLORS.white,
                      border: `2px solid ${role === r.id ? COLORS.mint : COLORS.gray200}`,
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <r.icon size={24} color={role === r.id ? COLORS.white : COLORS.gray600} strokeWidth={2} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: role === r.id ? COLORS.white : COLORS.gray900,
                    }}>
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{
              background: COLORS.white,
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${COLORS.gray100}`,
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: COLORS.gray900,
                marginBottom: '12px',
              }}>
                {language === 'en' ? 'Quick Actions' : 'Vitendo vya Haraka'}
              </div>
              <div style={{
                fontSize: '14px',
                color: COLORS.gray600,
                lineHeight: '1.6',
              }}>
                {language === 'en'
                  ? 'Use the quick action cards on the home screen to register patients, start triage, write prescriptions, and dispense medications with one tap.'
                  : 'Tumia kadi za vitendo vya haraka kwenye skrini ya nyumbani kusajili wagonjwa, kuanza triage, kuandika dawa, na kutoa dawa kwa kubofya mara moja.'
                }
              </div>
            </div>
            
            <div style={{
              background: COLORS.white,
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${COLORS.gray100}`,
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: COLORS.gray900,
                marginBottom: '12px',
              }}>
                {language === 'en' ? '1-Click Templates' : 'Violezo vya Kubofya Mara Moja'}
              </div>
              <div style={{
                fontSize: '14px',
                color: COLORS.gray600,
                lineHeight: '1.6',
              }}>
                {language === 'en'
                  ? 'Save time with pre-configured templates for common conditions like malaria, URTI, UTI, and pain management.'
                  : 'Okoa muda na violezo vilivyowekwa tayari kwa hali za kawaida kama malaria, URTI, UTI, na usimamizi wa maumivu.'
                }
              </div>
            </div>
            
            <div style={{
              background: COLORS.white,
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${COLORS.gray100}`,
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: COLORS.gray900,
                marginBottom: '12px',
              }}>
                {language === 'en' ? 'AI Assistant' : 'Msaidizi wa AI'}
              </div>
              <div style={{
                fontSize: '14px',
                color: COLORS.gray600,
                lineHeight: '1.6',
              }}>
                {language === 'en'
                  ? 'Get intelligent suggestions for diagnoses, drug interactions, and clinical decisions in both English and Swahili.'
                  : 'Pata mapendekezo mahiri ya utambuzi, mwingiliano wa dawa, na maamuzi ya kliniki kwa Kiingereza na Kiswahili.'
                }
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div style={{
            textAlign: 'center',
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: COLORS.mintLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              animation: 'pulse 2s infinite',
            }}>
              <Check size={60} color={COLORS.mint} strokeWidth={3} />
            </div>
            
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: COLORS.gray900,
              margin: '0 0 12px 0',
            }}>
              {language === 'en' ? 'All Set!' : 'Tayari Kabisa!'}
            </h2>
            
            <p style={{
              fontSize: '15px',
              color: COLORS.gray600,
              lineHeight: '1.6',
              marginBottom: '32px',
            }}>
              {language === 'en'
                ? `${clinicName} is now ready to serve patients. You'll save 5 hours daily with our smart workflows.`
                : `${clinicName} sasa iko tayari kutumikia wagonjwa. Utaokoa masaa 5 kila siku na mtiririko wetu mahiri.`
              }
            </p>
            
            <div style={{
              background: COLORS.skyLight,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: COLORS.gray900,
                marginBottom: '8px',
              }}>
                {language === 'en' ? '💡 Pro Tip' : '💡 Kidokezo cha Kitaalamu'}
              </div>
              <div style={{
                fontSize: '13px',
                color: COLORS.gray600,
                lineHeight: '1.5',
              }}>
                {language === 'en'
                  ? 'Use the language toggle in the top-right corner to switch between English and Swahili anytime.'
                  : 'Tumia kibonyeza cha lugha kwenye pembe ya juu kulia kubadilisha kati ya Kiingereza na Kiswahili wakati wowote.'
                }
              </div>
            </div>
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
        boxShadow: '0 -4px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
        }}>
          {!isFirstStep && (
            <button
              onClick={handleBack}
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
            onClick={handleNext}
            disabled={!canProceed()}
            style={{
              flex: 2,
              background: canProceed() ? step.color : COLORS.gray200,
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 600,
              color: COLORS.white,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: canProceed() ? `0 4px 12px ${step.color}40` : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {isLastStep ? (
              <>
                <Rocket size={20} />
                {language === 'en' ? 'Start Using Kliniki' : 'Anza Kutumia Kliniki'}
              </>
            ) : (
              <>
                {language === 'en' ? 'Continue' : 'Endelea'}
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
