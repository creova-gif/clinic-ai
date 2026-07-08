/**
 * AI Triage Engine - AfyaCare Tanzania
 * 
 * AI-powered symptom assessment and risk scoring
 * Supports Swahili and English voice/text input
 * 
 * Features:
 * - Symptom analysis
 * - Risk level scoring (Low, Medium, High)
 * - Care pathway suggestions
 * - Possible condition identification
 * - Multilingual support (Swahili/English)
 */

import { supabase, USE_MOCK_DATA } from './supabase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TriageAssessment {
  id: string;
  patient_id: string;
  patient_name: string;
  symptoms: string[]; // List of symptoms
  symptom_text: string; // Original input (voice/text)
  language: 'sw' | 'en';
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number; // 0-100
  suggested_action: string; // e.g., "Doctor consultation", "Self-care", "Emergency"
  possible_conditions: string[]; // AI-suggested conditions
  care_pathway: string; // Recommended next steps
  vitals?: {
    temperature?: number;
    blood_pressure?: string;
    heart_rate?: number;
    oxygen_saturation?: number;
  };
  created_at: string;
  created_by: string; // CHW or nurse
}

export interface TriageInput {
  patient_id: string;
  patient_name: string;
  symptoms: string[];
  symptom_text: string;
  language: 'sw' | 'en';
  vitals?: TriageAssessment['vitals'];
  created_by: string;
}

// ============================================================================
// AI TRIAGE API
// ============================================================================

export const aiTriageApi = {
  /**
   * Perform AI triage assessment
   */
  async performTriage(input: TriageInput): Promise<TriageAssessment> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: AI Triage performed', input);
      return getMockTriageResult(input);
    }

    try {
      // In production, this would call OpenAI API
      // For now, use rule-based triage
      const assessment = await analyzeSymptoms(input);

      // Save to database
      const { data, error } = await supabase
        .from('triage_assessments')
        .insert(assessment as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Triage error:', error);
      throw error;
    }
  },

  /**
   * Get triage history for patient
   */
  async getTriageHistory(patientId: string): Promise<TriageAssessment[]> {
    if (USE_MOCK_DATA) {
      return [getMockTriageResult({
        patient_id: patientId,
        patient_name: 'Mock Patient',
        symptoms: ['fever', 'headache'],
        symptom_text: 'Mgonjwa ana homa na maumivu ya kichwa',
        language: 'sw',
        created_by: 'nurse-1',
      })];
    }

    const { data, error } = await supabase
      .from('triage_assessments')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Voice-to-text conversion (Swahili/English)
   */
  async transcribeSymptoms(audioBlob: Blob, language: 'sw' | 'en'): Promise<string> {
    if (USE_MOCK_DATA) {
      return language === 'sw' 
        ? 'Mgonjwa ana homa, maumivu ya kichwa, na kichefuchefu'
        : 'Patient has fever, headache, and nausea';
    }

    // In production, use OpenAI Whisper or Google Speech-to-Text
    // For now, return mock
    return 'Transcription not implemented in development mode';
  },
};

// ============================================================================
// AI ANALYSIS ENGINE
// ============================================================================

async function analyzeSymptoms(input: TriageInput): Promise<TriageAssessment> {
  // Rule-based triage (production would use OpenAI)
  const symptoms = input.symptoms.map(s => s.toLowerCase());
  
  // Calculate risk score
  let riskScore = 0;
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let suggestedAction = '';
  let possibleConditions: string[] = [];
  let carePathway = '';

  // High-risk symptoms
  const highRiskSymptoms = [
    'chest pain', 'maumivu ya kifua',
    'severe headache', 'maumivu makali ya kichwa',
    'difficulty breathing', 'shida ya kupumua',
    'unconscious', 'amezimia',
    'bleeding', 'damu inatoka',
    'severe abdominal pain', 'maumivu makali ya tumbo',
  ];

  // Medium-risk symptoms
  const mediumRiskSymptoms = [
    'fever', 'homa',
    'vomiting', 'kutapika',
    'diarrhea', 'kuhara',
    'headache', 'maumivu ya kichwa',
    'body aches', 'maumivu ya mwili',
  ];

  // Check vitals
  if (input.vitals) {
    if (input.vitals.temperature && input.vitals.temperature > 38.5) {
      riskScore += 20;
    }
    if (input.vitals.blood_pressure) {
      const systolic = parseInt(input.vitals.blood_pressure.split('/')[0]);
      if (systolic > 140 || systolic < 90) {
        riskScore += 25;
      }
    }
    if (input.vitals.oxygen_saturation && input.vitals.oxygen_saturation < 95) {
      riskScore += 30;
    }
  }

  // Check symptoms
  const hasHighRisk = symptoms.some(s => 
    highRiskSymptoms.some(hrs => s.includes(hrs))
  );

  const hasMediumRisk = symptoms.some(s => 
    mediumRiskSymptoms.some(mrs => s.includes(mrs))
  );

  if (hasHighRisk) {
    riskScore += 50;
  } else if (hasMediumRisk) {
    riskScore += 30;
  } else {
    riskScore += 10;
  }

  // Determine risk level
  if (riskScore >= 60) {
    riskLevel = 'high';
    suggestedAction = 'Emergency - Immediate doctor consultation required';
    carePathway = 'Escalate to emergency department. Priority consultation.';
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
    suggestedAction = 'Doctor consultation recommended';
    carePathway = 'Schedule consultation within 24 hours. Monitor vitals.';
  } else {
    riskLevel = 'low';
    suggestedAction = 'Self-care or pharmacy consultation';
    carePathway = 'OTC medication may be sufficient. Follow up if symptoms persist.';
  }

  // Identify possible conditions (rule-based)
  if (symptoms.includes('fever') || symptoms.includes('homa')) {
    if (symptoms.includes('headache') || symptoms.includes('maumivu ya kichwa')) {
      possibleConditions.push('Malaria', 'Typhoid', 'Viral infection');
    } else {
      possibleConditions.push('Viral infection', 'Bacterial infection');
    }
  }

  if (symptoms.includes('cough') || symptoms.includes('kikohozi')) {
    possibleConditions.push('Upper respiratory infection', 'Pneumonia', 'TB (if persistent)');
  }

  if (symptoms.includes('vomiting') || symptoms.includes('kutapika')) {
    if (symptoms.includes('diarrhea') || symptoms.includes('kuhara')) {
      possibleConditions.push('Gastroenteritis', 'Food poisoning', 'Cholera');
    }
  }

  if (possibleConditions.length === 0) {
    possibleConditions.push('General consultation needed');
  }

  return {
    id: 'temp-' + Date.now(),
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    symptoms: input.symptoms,
    symptom_text: input.symptom_text,
    language: input.language,
    risk_level: riskLevel,
    risk_score: riskScore,
    suggested_action: suggestedAction,
    possible_conditions: possibleConditions,
    care_pathway: carePathway,
    vitals: input.vitals,
    created_at: new Date().toISOString(),
    created_by: input.created_by,
  };
}

// ============================================================================
// MOCK DATA
// ============================================================================

function getMockTriageResult(input: TriageInput): TriageAssessment {
  return {
    id: 'mock-triage-' + Date.now(),
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    symptoms: input.symptoms,
    symptom_text: input.symptom_text,
    language: input.language,
    risk_level: 'medium',
    risk_score: 65,
    suggested_action: 'Doctor consultation recommended',
    possible_conditions: [
      'Malaria',
      'Typhoid',
      'Viral infection',
    ],
    care_pathway: 'Schedule consultation within 24 hours. Monitor temperature. Ensure adequate hydration.',
    vitals: input.vitals || {
      temperature: 38.5,
      heart_rate: 92,
      blood_pressure: '125/80',
      oxygen_saturation: 98,
    },
    created_at: new Date().toISOString(),
    created_by: input.created_by,
  };
}

// ============================================================================
// SYMPTOM LIBRARY (Swahili/English)
// ============================================================================

export const COMMON_SYMPTOMS = {
  sw: [
    { id: 'fever', label: 'Homa' },
    { id: 'headache', label: 'Maumivu ya kichwa' },
    { id: 'cough', label: 'Kikohozi' },
    { id: 'vomiting', label: 'Kutapika' },
    { id: 'diarrhea', label: 'Kuhara' },
    { id: 'body_aches', label: 'Maumivu ya mwili' },
    { id: 'nausea', label: 'Kichefuchefu' },
    { id: 'chest_pain', label: 'Maumivu ya kifua' },
    { id: 'difficulty_breathing', label: 'Shida ya kupumua' },
    { id: 'abdominal_pain', label: 'Maumivu ya tumbo' },
    { id: 'fatigue', label: 'Uchovu' },
    { id: 'dizziness', label: 'Kizunguzungu' },
  ],
  en: [
    { id: 'fever', label: 'Fever' },
    { id: 'headache', label: 'Headache' },
    { id: 'cough', label: 'Cough' },
    { id: 'vomiting', label: 'Vomiting' },
    { id: 'diarrhea', label: 'Diarrhea' },
    { id: 'body_aches', label: 'Body aches' },
    { id: 'nausea', label: 'Nausea' },
    { id: 'chest_pain', label: 'Chest pain' },
    { id: 'difficulty_breathing', label: 'Difficulty breathing' },
    { id: 'abdominal_pain', label: 'Abdominal pain' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'dizziness', label: 'Dizziness' },
  ],
};
