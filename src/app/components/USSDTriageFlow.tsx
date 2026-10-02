/**
 * USSDTriageFlow - Production USSD Symptom Triage (*123#)
 * Exact implementation of AfyaAI USSD specification
 * 
 * Short code: *123#
 * Max session: ~90 seconds
 * Max questions: 5-7
 * Output: Risk level + next step + referral code
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Phone, MessageSquare, Send } from 'lucide-react';
import { Button } from './ui/button';
import { ClinicalUseNotice } from './ClinicalUseNotice';
import {
  classifyUssdRisk,
  isClinicalTriageEnabled,
  PRODUCT_HOLD_NOTICE,
} from '@/app/services/clinicalProductHold';

interface USSDTriageFlowProps {
  onBack: () => void;
}

interface SessionData {
  sessionId: string;
  language: 'sw' | 'en';
  reasonForUse?: string;
  ageGroup?: string;
  pregnancy?: boolean;
  symptom?: string;
  dangerSign?: string;
  consciousness?: string;
  riskLevel?: 'LOW' | 'URGENT' | 'EMERGENCY';
  productHold?: boolean;
  recommendation?: string;
  facility?: string;
  referralCode?: string;
  timestamp: number;
}

export function USSDTriageFlow({ onBack }: USSDTriageFlowProps) {
  const [screen, setScreen] = useState(0);
  const [session, setSession] = useState<SessionData>({
    sessionId: `S${Date.now()}`,
    language: 'sw',
    timestamp: Date.now(),
  });
  const [ussdLog, setUssdLog] = useState<string[]>(['*123#']);
  const [showSMS, setShowSMS] = useState(false);

  // Track session time
  const [sessionTime, setSessionTime] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - session.timestamp) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [session.timestamp]);

  const addToLog = (text: string, isUser: boolean = false) => {
    setUssdLog(prev => [...prev, isUser ? `> ${text}` : text]);
  };

  const handleOption = (value: string, label: string) => {
    addToLog(label, true);
    
    // Process based on current screen
    switch (screen) {
      case 0: // Language
        setSession(prev => ({ ...prev, language: value as 'sw' | 'en' }));
        setScreen(1);
        break;
        
      case 1: // Reason for use
        if (value === '5') {
          // Emergency shortcut
          setSession(prev => ({ ...prev, reasonForUse: 'emergency' }));
          setScreen(999); // Emergency screen
        } else {
          setSession(prev => ({ ...prev, reasonForUse: value }));
          setScreen(2);
        }
        break;
        
      case 2: // Age group
        setSession(prev => ({ ...prev, ageGroup: value }));
        // If age 18-49, ask pregnancy. Otherwise skip to symptoms
        if (value === '3') {
          setScreen(3);
        } else {
          setScreen(4);
        }
        break;
        
      case 3: // Pregnancy
        setSession(prev => ({ ...prev, pregnancy: value === '1' }));
        setScreen(4);
        break;
        
      case 4: // Main symptom
        setSession(prev => ({ ...prev, symptom: value }));
        setScreen(5);
        break;
        
      case 5: // Danger sign
        setSession(prev => ({ ...prev, dangerSign: value }));
        setScreen(6);
        break;
        
      case 6: // Consciousness
        setSession(prev => ({ ...prev, consciousness: value }));
        // Calculate risk and show results
        computeRiskAndResults();
        break;
    }
  };

  const computeRiskAndResults = () => {
    if (!isClinicalTriageEnabled()) {
      setSession(prev => ({
        ...prev,
        riskLevel: undefined,
        productHold: true,
        recommendation: 'product_hold',
        facility: '',
        referralCode: '',
      }));
      setScreen(100);
      return;
    }

    let recommendation = '';
    let facility = '';

    const riskLevel = classifyUssdRisk({
      ageGroup: session.ageGroup,
      pregnancy: session.pregnancy,
      symptom: session.symptom,
      dangerSign: session.dangerSign,
      consciousness: session.consciousness,
    }) as 'LOW' | 'URGENT' | 'EMERGENCY';

    if (riskLevel === 'EMERGENCY') {
      recommendation = 'emergency';
      facility = 'Muhimbili National Hospital';
    } else if (riskLevel === 'URGENT') {
      recommendation = 'visit_clinic';
      facility = session.language === 'sw' ? 'Kituo cha Afya Kariakoo' : 'Kariakoo Health Centre';
    } else {
      recommendation = 'self_care';
      facility = session.language === 'sw' ? 'Kituo cha Afya Kariakoo' : 'Kariakoo Health Centre';
    }
    
    const codePrefix = riskLevel === 'EMERGENCY' ? '8' : riskLevel === 'URGENT' ? '2' : '1';
    const referralCode = `AFYA-${codePrefix}${Math.floor(Math.random() * 900 + 100)}`;
    
    setSession(prev => ({
      ...prev,
      riskLevel,
      productHold: false,
      recommendation,
      facility,
      referralCode,
    }));
    
    setScreen(100); // Results screen
  };

  // Helper to get fever duration (stored in dangerSign for fever symptom)
  // Content definitions
  const screens = {
    0: {
      sw: {
        title: 'Karibu AfyaAI.',
        subtitle: 'Chagua lugha / Choose language:',
        options: [
          { value: 'sw', label: '1. Kiswahili' },
          { value: 'en', label: '2. English' },
        ],
      },
      en: {
        title: 'Welcome to AfyaAI.',
        subtitle: 'Chagua lugha / Choose language:',
        options: [
          { value: 'sw', label: '1. Kiswahili' },
          { value: 'en', label: '2. English' },
        ],
      },
    },
    1: {
      sw: {
        title: 'AfyaAI hukusaidia kuelewa dalili zako.',
        subtitle: 'Unahitaji msaada gani leo?',
        options: [
          { value: '1', label: '1. Nina dalili / I have symptoms' },
          { value: '2', label: '2. Nina ujauzito / Pregnancy' },
          { value: '3', label: '3. Mtoto anaumwa / Child is sick' },
          { value: '4', label: '4. Dawa au matokeo / Meds or results' },
          { value: '5', label: '5. Dharura / Emergency' },
        ],
      },
      en: {
        title: 'AfyaAI helps you understand your health.',
        subtitle: 'What do you need help with?',
        options: [
          { value: '1', label: '1. I have symptoms' },
          { value: '2', label: '2. Pregnancy' },
          { value: '3', label: '3. Child is sick' },
          { value: '4', label: '4. Meds or results' },
          { value: '5', label: '5. Emergency' },
        ],
      },
    },
    2: {
      sw: {
        title: 'Tafadhali chagua umri wa mgonjwa:',
        options: [
          { value: '1', label: '1. Chini ya miaka 5' },
          { value: '2', label: '2. Miaka 5-17' },
          { value: '3', label: '3. Miaka 18-49' },
          { value: '4', label: '4. Miaka 50+' },
        ],
      },
      en: {
        title: 'Select age:',
        options: [
          { value: '1', label: '1. Under 5' },
          { value: '2', label: '2. 5-17' },
          { value: '3', label: '3. 18-49' },
          { value: '4', label: '4. 50+' },
        ],
      },
    },
    3: {
      sw: {
        title: 'Je, una ujauzito?',
        options: [
          { value: '1', label: '1. Ndiyo' },
          { value: '2', label: '2. Hapana' },
        ],
      },
      en: {
        title: 'Are you pregnant?',
        options: [
          { value: '1', label: '1. Yes' },
          { value: '2', label: '2. No' },
        ],
      },
    },
    4: {
      sw: {
        title: 'Dalili kuu ni ipi?',
        options: [
          { value: '1', label: '1. Homa' },
          { value: '2', label: '2. Kikohozi / Kupumua kwa shida' },
          { value: '3', label: '3. Maumivu makali' },
          { value: '4', label: '4. Kuhara au kutapika' },
          { value: '5', label: '5. Kutokwa damu' },
          { value: '6', label: '6. Nyingine' },
        ],
      },
      en: {
        title: 'Main symptom:',
        options: [
          { value: '1', label: '1. Fever' },
          { value: '2', label: '2. Cough / breathing trouble' },
          { value: '3', label: '3. Severe pain' },
          { value: '4', label: '4. Diarrhea or vomiting' },
          { value: '5', label: '5. Bleeding' },
          { value: '6', label: '6. Other' },
        ],
      },
    },
    5: {
      // Adaptive based on symptom
      sw: {
        '1': { // Fever
          title: 'Homa imechukua siku ngapi?',
          options: [
            { value: '1', label: '1. Chini ya siku 2' },
            { value: '2', label: '2. Siku 2-3' },
            { value: '3', label: '3. Zaidi ya siku 3' },
          ],
        },
        '2': { // Breathing
          title: 'Je, unapumua kwa shida?',
          options: [
            { value: '1', label: '1. Ndiyo, sana' },
            { value: '2', label: '2. Ndiyo, kidogo' },
            { value: '3', label: '3. Hapana' },
          ],
        },
        '5': { // Bleeding
          title: 'Kutokwa damu ni:',
          options: [
            { value: '1', label: '1. Kidogo' },
            { value: '2', label: '2. Kingi' },
          ],
        },
        default: {
          title: 'Dalili ni kali?',
          options: [
            { value: '1', label: '1. Ndiyo, sana' },
            { value: '2', label: '2. Wastani' },
            { value: '3', label: '3. Kidogo' },
          ],
        },
      },
      en: {
        '1': { // Fever
          title: 'How long have you had fever?',
          options: [
            { value: '1', label: '1. Less than 2 days' },
            { value: '2', label: '2. 2-3 days' },
            { value: '3', label: '3. More than 3 days' },
          ],
        },
        '2': { // Breathing
          title: 'Is breathing difficult?',
          options: [
            { value: '1', label: '1. Yes, very' },
            { value: '2', label: '2. Yes, a little' },
            { value: '3', label: '3. No' },
          ],
        },
        '5': { // Bleeding
          title: 'Bleeding is:',
          options: [
            { value: '1', label: '1. Light' },
            { value: '2', label: '2. Heavy' },
          ],
        },
        default: {
          title: 'How severe?',
          options: [
            { value: '1', label: '1. Very severe' },
            { value: '2', label: '2. Moderate' },
            { value: '3', label: '3. Mild' },
          ],
        },
      },
    },
    6: {
      sw: {
        title: 'Je, mgonjwa:',
        options: [
          { value: '1', label: '1. Yuko macho na anaongea' },
          { value: '2', label: '2. Ana usingizi mwingi / amechanganyikiwa' },
          { value: '3', label: '3. Hana fahamu' },
        ],
      },
      en: {
        title: 'Patient condition:',
        options: [
          { value: '1', label: '1. Awake and talking' },
          { value: '2', label: '2. Very sleepy / confused' },
          { value: '3', label: '3. Unconscious' },
        ],
      },
    },
    999: { // Emergency shortcut
      sw: {
        title: 'Ikiwa kuna hatari ya maisha:',
        message: [
          '• Piga 112 sasa',
          '• Nenda hospitali ya karibu',
          '',
          'AfyaAI haibadilishi daktari.',
        ],
      },
      en: {
        title: 'If life-threatening:',
        message: [
          '• Call 112 now',
          '• Go to nearest hospital',
          '',
          'AfyaAI does not replace a doctor.',
        ],
      },
    },
  };

  const results = {
    LOW: {
      sw: {
        title: '🟢 DALILI ZA KAWAIDA',
        message: [
          'Dalili zako zinaonekana kuwa si hatari kwa sasa.',
          '',
          'Ushauri:',
          '• Pumzika',
          '• Kunywa maji mengi',
          '• Fuatilia dalili',
          '',
          'Ikiwa hazitapungua, tembelea kituo cha afya.',
        ],
      },
      en: {
        title: '🟢 LOW RISK',
        message: [
          'Your symptoms appear mild for now.',
          '',
          'Advice:',
          '• Rest',
          '• Drink plenty of water',
          '• Monitor symptoms',
          '',
          'If they don\'t improve, visit a health facility.',
        ],
      },
    },
    URGENT: {
      sw: {
        title: '🟡 DALILI ZINAHITAJI KUANGALIWA',
        message: [
          'Dalili zako zinahitaji kuangaliwa na mhudumu wa afya.',
          '',
          'Tafadhali tembelea:',
          '{facility}',
          '',
          'Leo au kesho.',
          '',
          'Rejea: {code}',
          'Utapokea SMS ya uthibitisho.',
        ],
      },
      en: {
        title: '🟠 URGENT',
        message: [
          'Your symptoms need to be checked by a health worker.',
          '',
          'Please visit:',
          '{facility}',
          '',
          'Today or tomorrow.',
          '',
          'Ref: {code}',
          'You will receive a confirmation SMS.',
        ],
      },
    },
    EMERGENCY: {
      sw: {
        title: '🔴 HII NI DHARURA',
        message: [
          'Tafadhali nenda HARAKA kwenye:',
          '{facility}',
          '',
          'Au piga 112 sasa.',
          '',
          'Rejea: {code}',
          'Tunakutumia SMS ya maelekezo.',
        ],
      },
      en: {
        title: '🔴 THIS IS AN EMERGENCY',
        message: [
          'Please go IMMEDIATELY to:',
          '{facility}',
          '',
          'Or call 112 now.',
          '',
          'Ref: {code}',
          'We are sending you an SMS with instructions.',
        ],
      },
    },
  };

  // Get current screen content
  const getCurrentScreen = () => {
    if (screen === 100 && session.productHold) {
      return {
        title: PRODUCT_HOLD_NOTICE.en,
        message: [PRODUCT_HOLD_NOTICE.sw],
      };
    } else if (screen === 100 && session.riskLevel) {
      // Results screen
      const result = results[session.riskLevel][session.language];
      return {
        title: result.title,
        message: result.message.map(line =>
          line
            .replace('{facility}', session.facility || '')
            .replace('{code}', session.referralCode || '')
        ),
      };
    } else if (screen === 999) {
      // Emergency
      return screens[999][session.language];
    } else if (screen === 5) {
      // Adaptive danger sign
      const symptom = session.symptom || 'default';
      const content = (screens[5] as any)[session.language][symptom] || (screens[5] as any)[session.language].default;
      return content;
    } else {
      return (screens as any)[screen][session.language];
    }
  };

  const currentScreen = getCurrentScreen();

  return (
    <div className="min-h-screen bg-black text-[#00FF00] font-mono">
      {!isClinicalTriageEnabled() && <ClinicalUseNotice mode="hold" />}
      {isClinicalTriageEnabled() && screen === 100 && session.riskLevel && (
        <ClinicalUseNotice mode="unvalidated" />
      )}
      {/* USSD Screen */}
      <div className="max-w-md mx-auto">
        {/* Status Bar */}
        <div className="bg-[#00FF00] text-black px-4 py-2 flex justify-between text-xs">
          <span>USSD</span>
          <span>*123#</span>
          <span>{sessionTime}s</span>
        </div>

        {/* Screen Content */}
        <div className="p-4 min-h-[500px] flex flex-col">
          {/* Session Log (scrollable) */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-1 max-h-64">
            <AnimatePresence>
              {ussdLog.map((line, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={line.startsWith('>') ? 'text-[#FFFF00]' : 'text-[#00FF00]'}
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Current Screen */}
          <div className="border-t border-[#00FF00]/30 pt-4">
            {screen < 100 && screen !== 999 && (
              <>
                {/* Title */}
                {currentScreen.title && (
                  <div className="mb-3 text-[#00FF00]">
                    {currentScreen.title}
                  </div>
                )}
                
                {/* Subtitle */}
                {currentScreen.subtitle && (
                  <div className="mb-3 text-[#00FF00]/80">
                    {currentScreen.subtitle}
                  </div>
                )}

                {/* Options */}
                <div className="space-y-2">
                  {currentScreen.options?.map((option: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleOption(option.value, option.label)}
                      className="w-full text-left p-2 bg-[#00FF00]/10 hover:bg-[#00FF00]/20 border border-[#00FF00]/30 rounded transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Results Screen */}
            {screen === 100 && (
              <div className="space-y-3">
                <div className="text-[#00FF00] font-bold mb-3">
                  {currentScreen.title}
                </div>
                {currentScreen.message?.map((line: string, idx: number) => (
                  <div key={idx} className="text-[#00FF00]">
                    {line}
                  </div>
                ))}
                
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => {
                      setShowSMS(true);
                      // Simulate SMS send
                      setTimeout(() => {
                        alert(
                          session.language === 'sw'
                            ? `SMS imetumwa kwa nambari yako.\n\nAfyaAI: Tafadhali tembelea ${session.facility}.\nRejea: ${session.referralCode}.\nMaswali? Piga 0800-AFYA.`
                            : `SMS sent to your number.\n\nAfyaAI: Please visit ${session.facility}.\nRef: ${session.referralCode}.\nQuestions? Call 0800-AFYA.`
                        );
                      }, 500);
                    }}
                    className="w-full p-3 bg-[#00FF00]/20 hover:bg-[#00FF00]/30 border border-[#00FF00] rounded transition-colors"
                  >
                    {session.language === 'sw' ? '1. Tuma SMS' : '1. Send SMS'}
                  </button>
                  <button
                    onClick={() => {
                      setScreen(0);
                      setSession({
                        sessionId: `S${Date.now()}`,
                        language: session.language,
                        timestamp: Date.now(),
                      });
                      setUssdLog(['*123#']);
                    }}
                    className="w-full p-3 bg-[#00FF00]/10 hover:bg-[#00FF00]/20 border border-[#00FF00]/30 rounded transition-colors"
                  >
                    {session.language === 'sw' ? '2. Anza Upya' : '2. Start Over'}
                  </button>
                </div>
              </div>
            )}

            {/* Emergency Screen */}
            {screen === 999 && (
              <div className="space-y-3">
                <div className="text-[#FF0000] font-bold mb-3 animate-pulse">
                  {currentScreen.title}
                </div>
                {currentScreen.message?.map((line: string, idx: number) => (
                  <div key={idx} className="text-[#00FF00]">
                    {line}
                  </div>
                ))}
                
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setScreen(0);
                      setSession({
                        sessionId: `S${Date.now()}`,
                        language: session.language,
                        timestamp: Date.now(),
                      });
                      setUssdLog(['*123#']);
                    }}
                    className="w-full p-3 bg-red-900/50 hover:bg-red-900/70 border border-red-500 rounded transition-colors"
                  >
                    0. {session.language === 'sw' ? 'Rudi' : 'Back'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exit option */}
          {screen > 0 && screen < 100 && screen !== 999 && (
            <div className="mt-4 pt-4 border-t border-[#00FF00]/30">
              <button
                onClick={onBack}
                className="w-full p-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/50 rounded transition-colors text-sm"
              >
                0. {session.language === 'sw' ? 'Toka' : 'Exit'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Developer Info (hidden in production) */}
      <div className="max-w-md mx-auto px-4 pb-4">
        <div className="text-[#00FF00]/50 text-xs space-y-1">
          <div>Session: {session.sessionId}</div>
          <div>Time: {sessionTime}s / 90s</div>
          <div>Screen: {screen}</div>
          {session.riskLevel && <div>Risk: {session.riskLevel}</div>}
          {session.referralCode && <div>Code: {session.referralCode}</div>}
        </div>
      </div>
    </div>
  );
}
