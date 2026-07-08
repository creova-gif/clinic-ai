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

  /**
   * Submit AI telemetry feedback to improve the model
   */
  async submitTelemetry(
    assessmentId: string, 
    originalLevel: string, 
    actualOutcome: string, 
    feedbackNotes: string, 
    clinicianId: string
  ): Promise<boolean> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: AI Telemetry submitted', { assessmentId, originalLevel, actualOutcome });
      return true;
    }

    try {
      const { error } = await supabase
        .from('ai_telemetry')
        .insert({
          assessment_id: assessmentId,
          original_level: originalLevel,
          actual_outcome: actualOutcome,
          feedback_notes: feedbackNotes,
          created_by: clinicianId,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Telemetry error:', error);
      return false;
    }
  },
};

// ============================================================================
// AI ANALYSIS ENGINE
// ============================================================================

import { performLocalTriage } from './localTriageEngine';

// ... (keep the rest of the file intact, but replace the analyzeSymptoms function)

async function analyzeSymptoms(input: TriageInput): Promise<TriageAssessment> {
  // Use the local WebAssembly model for triage
  const symptomsText = input.symptoms.join(', ') + (input.symptom_text ? `. ${input.symptom_text}` : '');
  
  const vitals = input.vitals ? {
    temp: input.vitals.temperature,
    heartRate: input.vitals.heart_rate,
    bloodPressure: input.vitals.blood_pressure
  } : undefined;

  const localResult = await performLocalTriage(symptomsText, vitals);

  // Map the localTriageEngine result to TriageAssessment
  let riskScore = 10;
  if (localResult.level === 'emergency') riskScore = 90;
  else if (localResult.level === 'urgent') riskScore = 70;
  else if (localResult.level === 'moderate') riskScore = 40;

  // Identify possible conditions (basic rule-based as fallback)
  let possibleConditions: string[] = [];
  const lowerSymptoms = symptomsText.toLowerCase();
  if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('homa')) {
    if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('maumivu ya kichwa')) {
      possibleConditions.push('Malaria', 'Typhoid', 'Viral infection');
    } else {
      possibleConditions.push('Viral infection', 'Bacterial infection');
    }
  }

  if (lowerSymptoms.includes('cough') || lowerSymptoms.includes('kikohozi')) {
    possibleConditions.push('Upper respiratory infection', 'Pneumonia', 'TB (if persistent)');
  }

  if (lowerSymptoms.includes('vomiting') || lowerSymptoms.includes('kutapika')) {
    if (lowerSymptoms.includes('diarrhea') || lowerSymptoms.includes('kuhara')) {
      possibleConditions.push('Gastroenteritis', 'Food poisoning', 'Cholera');
    }
  }

  if (possibleConditions.length === 0) {
    possibleConditions.push('General consultation needed');
  }

  // Use the reasoning from the model as well
  const carePathway = `${localResult.recommendation} ${localResult.reasoning.join('. ')}`;

  // Map levels
  const mappedLevel = localResult.level === 'emergency' || localResult.level === 'urgent' ? 'high' 
                    : localResult.level === 'moderate' ? 'medium' 
                    : 'low';

  return {
    id: 'triage-' + Date.now(),
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    symptoms: input.symptoms,
    symptom_text: input.symptom_text,
    language: input.language,
    risk_level: mappedLevel,
    risk_score: riskScore,
    suggested_action: localResult.recommendation,
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
