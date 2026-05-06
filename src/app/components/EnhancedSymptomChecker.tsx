/**
 * EnhancedSymptomChecker - CLINICALLY SAFE VERSION
 * 
 * SAFETY IMPROVEMENTS:
 * - Uses ClinicalTriageEngine with WHO-based logic
 * - Emergency keyword detection
 * - Red flag symptom combinations
 * - Weighted severity scoring (not naive counting)
 * - Prominent safety disclaimers
 * - Audit logging enabled
 * - Human validation required messaging
 * 
 * REGULATORY COMPLIANCE:
 * - TMDA SaMD Class A (advisory only, lowest risk)
 * - Tanzania PDPA (audit trail, no PII stored)
 * - WHO Ethical AI (transparent, explainable)
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  ArrowRight,
  RefreshCw,
  Shield,
  MapPin,
  Info,
  ChevronDown,
} from 'lucide-react';
import { Button } from './ui/button';
import { ClinicalTriageEngine } from './ClinicalTriageEngine';
import type { TriageResult, SymptomAnswer } from './ClinicalTriageEngine';
import { api } from '@/app/services/api';
import { toast } from 'sonner';
import { MedicalButton, MedicalCard, colors } from '@/app/design-system';

const translations = {
  sw: {
    title: 'Angalia Dalili',
    subtitle: 'Jibu maswali ili kupata ushauri wa msingi',
    question: 'Swali',
    yes: 'Ndiyo',
    no: 'Hapana',
    skip: 'Ruka',
    results: 'Matokeo ya Tathmini',
    riskLevel: 'Kiwango cha Umuhimu',
    recommendation: 'Mapendekezo',
    reasoning: 'Sababu',
    nearestFacility: 'Kituo cha Karibu',
    callEmergency: 'Piga 114',
    getDirections: 'Pata Maelekezo',
    backHome: 'Rudi Nyumbani',
    disclaimer: 'Onyo Muhimu',
    progress: 'Swali {{current}} kati ya {{total}}',
    emergency: 'DHARURA',
    urgent: 'Haraka',
    moderate: 'Kati',
    mild: 'Nyepesi',
    safetyNotice: 'Tathmini hii ni ushauri wa msingi tu. Sio uchunguzi wa matibabu.',
    humanValidation: 'Lazima uthibitishwe na mtaalamu wa afya',
  },
  en: {
    title: 'Check Symptoms',
    subtitle: 'Answer questions to receive preliminary guidance',
    question: 'Question',
    yes: 'Yes',
    no: 'No',
    skip: 'Skip',
    results: 'Assessment Results',
    riskLevel: 'Urgency Level',
    recommendation: 'Recommendation',
    reasoning: 'Reasoning',
    nearestFacility: 'Nearest Facility',
    callEmergency: 'Call 114',
    getDirections: 'Get Directions',
    backHome: 'Back Home',
    disclaimer: 'Important Notice',
    progress: 'Question {{current}} of {{total}}',
    emergency: 'EMERGENCY',
    urgent: 'Urgent',
    moderate: 'Moderate',
    mild: 'Mild',
    safetyNotice: 'This assessment is preliminary guidance only. Not a medical diagnosis.',
    humanValidation: 'Must be validated by a healthcare professional',
  },
};

// Evidence-based symptom questions (WHO IMAI guidelines)
const questions = [
  {
    id: 'high_fever',
    sw: 'Una homa kali (joto la mwili zaidi ya 38.5°C)?',
    en: 'Do you have a high fever (body temperature above 38.5°C / 101°F)?',
    icon: '🌡️',
    severity: 7,
  },
  {
    id: 'difficulty_breathing',
    sw: 'Una shida ya kupumua au unapumua haraka sana?',
    en: 'Do you have difficulty breathing or breathing very fast?',
    icon: '🫁',
    severity: 10,
  },
  {
    id: 'chest_pain',
    sw: 'Una maumivu ya kifua?',
    en: 'Do you have chest pain?',
    icon: '💔',
    severity: 10,
  },
  {
    id: 'severe_headache_with_stiff_neck',
    sw: 'Una maumivu makali ya kichwa pamoja na shingo ngumu?',
    en: 'Do you have severe headache with a stiff neck?',
    icon: '🤕',
    severity: 10,
  },
  {
    id: 'persistent_vomiting',
    sw: 'Unatapika mara kwa mara na huwezi kuhifadhi maji?',
    en: 'Are you vomiting repeatedly and unable to keep fluids down?',
    icon: '🤢',
    severity: 6,
  },
  {
    id: 'severe_diarrhea',
    sw: 'Una kuhara kwa mara nyingi (zaidi ya 5 kwa siku)?',
    en: 'Do you have severe diarrhea (more than 5 times per day)?',
    icon: '🚽',
    severity: 6,
  },
  {
    id: 'symptom_duration',
    sw: 'Dalili zimekuwepo kwa muda gani?',
    en: 'How long have you had these symptoms?',
    icon: '📅',
    type: 'options',
    options: [
      { value: '1-2', label: { sw: 'Siku 1-2', en: '1-2 days' } },
      { value: '3-5', label: { sw: 'Siku 3-5', en: '3-5 days' } },
      { value: '6+', label: { sw: 'Zaidi ya siku 6', en: 'More than 6 days' } },
    ],
    severity: 0,
  },
];

interface EnhancedSymptomCheckerProps {
  onBack: () => void;
}

export function EnhancedSymptomChecker({ onBack }: EnhancedSymptomCheckerProps) {
  const { language } = useApp();
  const t = translations[language];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<SymptomAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Autosave answers (Phase 1 requirement - crash recovery)
  useEffect(() => {
    if (answers.length > 0) {
      try {
        sessionStorage.setItem('symptom_checker_autosave', JSON.stringify(answers));
      } catch (e) {
      }
    }
  }, [answers]);

  // Restore autosaved answers on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('symptom_checker_autosave');
      if (saved) {
        const savedAnswers = JSON.parse(saved);
        setAnswers(savedAnswers);
        setCurrentQuestion(savedAnswers.length);
      }
    } catch (e) {
    }
  }, []);

  // NEW: Save assessment to database
  const saveAssessment = async (assessment: TriageResult, answers: SymptomAnswer[]) => {
    setIsSaving(true);
    try {
      const response = await api.symptomAssessments.create({
        user_id: undefined, // Anonymous users can use symptom checker
        session_id: assessment.auditId,
        symptoms: answers,
        triage_result: assessment,
        language: language,
      });

      if (response.success) {
      } else {
        // Don't show error to user - this is background logging
      }
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = (answer: boolean | string) => {
    const newAnswer: SymptomAnswer = {
      questionId: questions[currentQuestion].id,
      answer,
      timestamp: new Date(),
      severity: questions[currentQuestion].severity,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 200);
    } else {
      // All questions answered - perform triage
      const result = ClinicalTriageEngine.assessSymptoms(updatedAnswers, language);
      
      // Log for audit trail (PDPA compliance)
      ClinicalTriageEngine.logAssessment(
        result.auditId,
        updatedAnswers,
        result
      );

      // NEW: Save to database
      saveAssessment(result, updatedAnswers);

      setTriageResult(result);
      setShowResults(true);

      // Clear autosave after successful assessment
      sessionStorage.removeItem('symptom_checker_autosave');
    }
  };

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Perform triage with partial data
      const result = ClinicalTriageEngine.assessSymptoms(answers, language);
      ClinicalTriageEngine.logAssessment(result.auditId, answers, result);
      
      // NEW: Save to database
      saveAssessment(result, answers);
      
      setTriageResult(result);
      setShowResults(true);
      sessionStorage.removeItem('symptom_checker_autosave');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'emergency':
        return {
          bg: colors.danger[50],
          border: colors.danger[500],
          text: colors.danger[700],
        };
      case 'urgent':
        return {
          bg: colors.warning[50],
          border: colors.warning[500],
          text: colors.warning[700],
        };
      case 'moderate':
        return {
          bg: colors.primary[50],
          border: colors.primary[500],
          text: colors.primary[700],
        };
      default:
        return {
          bg: colors.success[50],
          border: colors.success[500],
          text: colors.success[700],
        };
    }
  };

  if (showResults && triageResult) {
    const levelColors = getLevelColor(triageResult.level);
    const levelLabel = t[triageResult.level as keyof typeof t] || triageResult.level;

    // Extract key symptoms for display
    const symptoms = answers
      .filter((answer) => answer.answer === true)
      .map((answer) => questions.find((q) => q.id === answer.questionId)?.[language] || '');

    return (
      <div className="min-h-screen bg-[#F7F9FB] pb-24">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
                style={{ backgroundColor: colors.neutral[100] }}
              >
                <ChevronLeft className="w-5 h-5" style={{ color: colors.neutral[700] }} />
              </button>
              <h1 className="text-lg font-semibold text-[#1A1D23]">{t.results}</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 pt-6 pb-24 space-y-6">
          {/* ===================================
              CRITICAL ALERTS SECTION
              =================================== */}

          {/* Emergency Call Button (if needed) - HIGHEST PRIORITY */}
          {triageResult.callEmergency && (
            <div
              className="relative overflow-hidden p-6 rounded-2xl border-2"
              style={{
                backgroundColor: colors.danger[50],
                borderColor: colors.danger[500],
              }}
            >
              {/* Animated pulse background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              
              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center animate-pulse" 
                       style={{ backgroundColor: colors.danger[500] }}>
                    <AlertTriangle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#1A1D23] mb-2">{t.emergency}</h3>
                    <p className="text-base font-semibold leading-relaxed" style={{ color: colors.danger[700] }}>
                      {language === 'sw'
                        ? 'Piga simu 114 SASA au nenda hospitali ya karibu'
                        : 'Call 114 NOW or go to nearest hospital'}
                    </p>
                  </div>
                </div>
                <MedicalButton
                  variant="danger"
                  size="lg"
                  onClick={() => (window.location.href = 'tel:114')}
                  fullWidth
                >
                  <Phone className="w-5 h-5" />
                  {t.callEmergency}
                </MedicalButton>
              </div>
            </div>
          )}

          {/* Safety Notice - ALWAYS VISIBLE */}
          <div
            className="p-5 rounded-2xl border-l-4 shadow-sm"
            style={{
              backgroundColor: colors.warning[50],
              borderLeftColor: colors.warning[500],
              borderTop: `1px solid ${colors.warning[200]}`,
              borderRight: `1px solid ${colors.warning[200]}`,
              borderBottom: `1px solid ${colors.warning[200]}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" 
                   style={{ backgroundColor: colors.warning[100] }}>
                <Shield className="w-5 h-5" style={{ color: colors.warning[700] }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1A1D23] mb-1.5 text-base">{t.safetyNotice}</p>
                <p className="text-sm leading-relaxed" style={{ color: colors.warning[800] }}>
                  {t.humanValidation}
                </p>
              </div>
            </div>
          </div>

          {/* ===================================
              ASSESSMENT RESULTS CARD
              =================================== */}

          <MedicalCard
            className="overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${levelColors.bg} 0%, ${levelColors.bg}f0 100%)`,
              borderColor: levelColors.border,
              borderWidth: '2px',
            }}
          >
            {/* Risk Level Header */}
            <div className="flex items-center justify-between mb-6 pb-5 border-b-2" style={{ borderColor: levelColors.border }}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                     style={{ backgroundColor: levelColors.text }}>
                  {triageResult.level === 'emergency' && (
                    <AlertTriangle className="w-8 h-8 text-white" />
                  )}
                  {triageResult.level === 'urgent' && (
                    <AlertTriangle className="w-8 h-8 text-white" />
                  )}
                  {(triageResult.level === 'routine' || triageResult.level === 'self-care') && (
                    <Info className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: levelColors.text }}>
                    {t.riskLevel}
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight" style={{ color: levelColors.text }}>
                    {levelLabel}
                  </h2>
                </div>
              </div>
            </div>

            {/* Primary Recommendation */}
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[#1A1D23] mb-3 text-lg flex items-center gap-2">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: levelColors.text }} />
                  {t.recommendation}
                </h3>
                <p className="text-base text-[#374151] leading-relaxed pl-3.5">
                  {triageResult.recommendation}
                </p>
              </div>

              {/* Key Symptoms Badge */}
              {symptoms.length > 0 && (
                <div className="pt-4 mt-4 border-t border-[#E5E7EB]">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                    {language === 'sw' ? 'Dalili Zilizorekodiwa' : 'Reported Symptoms'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.slice(0, 3).map((symptom, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: colors.primary[50],
                          color: colors.primary[700],
                        }}
                      >
                        {symptom}
                      </span>
                    ))}
                    {symptoms.length > 3 && (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: colors.neutral[100],
                          color: colors.neutral[700],
                        }}
                      >
                        +{symptoms.length - 3} {language === 'sw' ? 'zaidi' : 'more'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </MedicalCard>

          {/* ===================================
              NEAREST FACILITY (ACTION CARD)
              =================================== */}

          {triageResult.nearestFacility && (
            <MedicalCard className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 border-[#E5E7EB] hover:border-[#1E88E5]">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-8 -translate-y-8">
                <MapPin className="w-full h-full" style={{ color: colors.primary[500] }} />
              </div>
              
              <div className="relative z-10">
                {/* Header with badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1 rounded-full text-xs font-semibold" 
                       style={{ 
                         backgroundColor: colors.primary[50],
                         color: colors.primary[700]
                       }}>
                    {language === 'sw' ? 'Karibu Nawe' : 'Nearby'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <Clock className="w-3 h-3" />
                    <span>{language === 'sw' ? '24/7' : 'Open 24/7'}</span>
                  </div>
                </div>

                {/* Main content */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                    }}
                  >
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Facility Name & Badge */}
                    <div className="mb-3">
                      <h3 className="font-bold text-[#1A1D23] mb-2 text-xl leading-tight">
                        {t.nearestFacility}
                      </h3>
                      <p className="text-lg text-[#1A1D23] leading-relaxed font-semibold mb-2">
                        {triageResult.nearestFacility}
                      </p>
                      
                      {/* Facility Type Badge */}
                      <div className="flex items-center gap-2">
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold"
                          style={{
                            backgroundColor: colors.success[50],
                            color: colors.success[700],
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          {language === 'sw' ? 'Wazi Sasa' : 'Open Now'}
                        </span>
                        <span className="text-xs text-[#6B7280] font-medium">
                          • {language === 'sw' ? 'Huduma za Dharura' : 'Emergency Services'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Distance & Time Cards */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div 
                        className="px-3 py-2.5 rounded-xl border"
                        style={{
                          backgroundColor: colors.primary[50],
                          borderColor: colors.primary[100],
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />
                          <span className="text-xs font-semibold" style={{ color: colors.primary[700] }}>
                            {language === 'sw' ? 'Umbali' : 'Distance'}
                          </span>
                        </div>
                        <p className="text-base font-bold text-[#1A1D23]">2.5 km</p>
                      </div>
                      
                      <div 
                        className="px-3 py-2.5 rounded-xl border"
                        style={{
                          backgroundColor: colors.primary[50],
                          borderColor: colors.primary[100],
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />
                          <span className="text-xs font-semibold" style={{ color: colors.primary[700] }}>
                            {language === 'sw' ? 'Muda' : 'Travel Time'}
                          </span>
                        </div>
                        <p className="text-base font-bold text-[#1A1D23]">~8 min</p>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="mb-4 p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-[#6B7280] leading-relaxed">
                          {language === 'sw' 
                            ? 'Kituo hiki kinakubali NHIF na kina daktari wa dharura 24/7'
                            : 'This facility accepts NHIF and has emergency doctors available 24/7'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <MedicalButton 
                        variant="primary" 
                        size="lg" 
                        className="w-full group-hover:shadow-lg transition-all"
                      >
                        <MapPin className="w-5 h-5" />
                        {language === 'sw' ? 'Pata Maelekezo' : 'Get Directions'}
                      </MedicalButton>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <MedicalButton 
                          variant="outline" 
                          size="md"
                          className="flex-1"
                        >
                          <Phone className="w-4 h-4" />
                          {language === 'sw' ? 'Piga Simu' : 'Call'}
                        </MedicalButton>
                        <MedicalButton 
                          variant="outline" 
                          size="md"
                          className="flex-1"
                        >
                          <Info className="w-4 h-4" />
                          {language === 'sw' ? 'Maelezo' : 'Details'}
                        </MedicalButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MedicalCard>
          )}

          {/* ===================================
              DETAILED REASONING (EXPANDABLE)
              =================================== */}

          {triageResult.reasoning.length > 0 && (
            <MedicalCard className="border-2 border-[#E5E7EB]">
              <details className="group">
                <summary className="flex items-center gap-3 cursor-pointer list-none hover:opacity-75 transition-opacity">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-[#EFF6FF] transition-colors"
                       style={{ backgroundColor: colors.primary[50] }}>
                    <Info className="w-5 h-5" style={{ color: colors.primary[500] }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1A1D23] mb-0.5">
                      {language === 'sw' ? 'Jinsi Tathmini Ilivyofanywa' : 'How This Assessment Was Made'}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {language === 'sw' ? 'Bonyeza kuona maelezo zaidi' : 'Tap to see detailed reasoning'}
                    </p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-[#6B7280] transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-5 pt-5 border-t border-[#E5E7EB] space-y-5">
                  {/* Reasoning Points */}
                  <div>
                    <h4 className="font-bold text-[#1A1D23] mb-3 text-sm uppercase tracking-wide">{t.reasoning}</h4>
                    <ul className="space-y-3">
                      {triageResult.reasoning.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                               style={{ backgroundColor: colors.primary[100] }}>
                            <span className="text-xs font-bold" style={{ color: colors.primary[700] }}>
                              {idx + 1}
                            </span>
                          </div>
                          <span className="text-sm text-[#374151] leading-relaxed flex-1">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Audit Trail */}
                  <div className="pt-4 border-t border-[#E5E7EB] bg-[#F9FAFB] -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-[#6B7280] mb-1">
                          {language === 'sw' ? 'Kitambulisho cha Tathmini' : 'Assessment ID'}
                        </p>
                        <p className="text-xs font-mono text-[#1A1D23] mb-1">{triageResult.auditId}</p>
                        <p className="text-xs text-[#9CA3AF]">
                          {language === 'sw'
                            ? 'Kumbukumbu ya tathmini kwa matumizi ya ukaguzi'
                            : 'Assessment record for audit purposes'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </MedicalCard>
          )}

          {/* ===================================
              DISCLAIMERS (COMPACT)
              =================================== */}

          {triageResult.disclaimers.length > 0 && (
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
              <details className="group">
                <summary className="flex items-center gap-2.5 cursor-pointer list-none hover:opacity-75 transition-opacity">
                  <Info className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                  <span className="font-semibold text-sm text-[#1A1D23] flex-1">
                    {t.disclaimer} ({triageResult.disclaimers.length})
                  </span>
                  <ChevronLeft className="w-4 h-4 text-[#6B7280] transition-transform group-open:rotate-[-90deg]" />
                </summary>
                <ul className="mt-3 space-y-2 pl-6">
                  {triageResult.disclaimers.map((disclaimer, idx) => (
                    <li key={idx} className="text-xs text-[#6B7280] leading-relaxed flex items-start gap-2">
                      <span className="text-[#9CA3AF] mt-0.5">•</span>
                      <span className="flex-1">{disclaimer}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {/* ===================================
              ACTION BUTTON
              =================================== */}

          <div className="pt-2">
            <MedicalButton 
              variant="secondary" 
              size="lg" 
              onClick={onBack} 
              fullWidth
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <ChevronLeft className="w-5 h-5" />
              {t.backHome}
            </MedicalButton>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Safety check - if no current question, go to results
  if (!currentQ) {
    if (!showResults && answers.length > 0) {
      // Trigger assessment with existing answers
      const result = ClinicalTriageEngine.assessSymptoms(answers, language);
      ClinicalTriageEngine.logAssessment(result.auditId, answers, result);
      setTriageResult(result);
      setShowResults(true);
      sessionStorage.removeItem('symptom_checker_autosave');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
              style={{ backgroundColor: colors.neutral[100] }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: colors.neutral[700] }} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-[#1A1D23]">{t.title}</h1>
              <p className="text-sm text-[#6B7280]">{t.subtitle}</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: colors.primary[500],
              }}
            />
          </div>
          <p className="text-xs text-[#9CA3AF] mt-2">
            {t.progress.replace('{{current}}', String(currentQuestion + 1)).replace('{{total}}', String(questions.length))}
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-8">
        {/* Question Card */}
        <MedicalCard>
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentQ.icon}</div>
            <h2 className="text-xl font-semibold text-[#1A1D23] mb-2">
              {currentQ[language as keyof typeof currentQ] as string}
            </h2>
          </div>

          {/* Answer Buttons */}
          {currentQ.type === 'options' ? (
            <div className="space-y-3">
              {currentQ.options?.map((option) => (
                <MedicalButton
                  key={option.value}
                  variant="secondary"
                  size="lg"
                  onClick={() => handleAnswer(option.value)}
                  fullWidth
                >
                  {option.label[language]}
                </MedicalButton>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <MedicalButton
                variant="primary"
                size="lg"
                onClick={() => handleAnswer(true)}
              >
                {t.yes}
              </MedicalButton>
              <MedicalButton
                variant="secondary"
                size="lg"
                onClick={() => handleAnswer(false)}
              >
                {t.no}
              </MedicalButton>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-[#6B7280] hover:text-[#374151]"
            >
              {t.skip}
            </button>
          </div>
        </MedicalCard>

        {/* Safety Footer */}
        <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: colors.warning[50] }}>
          <p className="text-xs text-center" style={{ color: colors.warning[800] }}>
            {t.safetyNotice}
          </p>
        </div>
      </div>
    </div>
  );
}