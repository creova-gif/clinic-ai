/**
 * AI Triage Engine - AfyaCare Tanzania
 * 
 * AI-powered symptom assessment and risk scoring
 * Supports Swahili and English voice/text input
 * 
 * Features:
 * - Symptom analysis
 * - Risk levels kept distinct: low, medium, urgent, emergency
 * - Care pathway suggestions (supervised pilot only)
 * - Possible condition identification (supervised pilot only)
 * - Multilingual support (Swahili/English)
 *
 * Clinical output is behind VITE_CLINICAL_TRIAGE_ENABLED (off by default).
 */

import { supabase, USE_MOCK_DATA } from './supabase';
import { performLocalTriage } from './localTriageEngine';
import {
  deriveTriageAssessment,
  heldTriageAssessment,
  isClinicalTriageEnabled,
  redactClinicalTriage,
  UNVALIDATED_TRIAGE_BANNER,
  type TriageAssessment as ClinicalTriageAssessment,
  type TriageAssessmentInput,
} from './clinicalProductHold';

export type TriageAssessment = ClinicalTriageAssessment;

export type TriageInput = TriageAssessmentInput;

// ============================================================================
// AI TRIAGE API
// ============================================================================

export const aiTriageApi = {
  /**
   * Perform AI triage assessment
   */
  async performTriage(input: TriageInput): Promise<TriageAssessment> {
    if (!isClinicalTriageEnabled()) {
      return heldTriageAssessment(input);
    }

    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: AI Triage performed', input);
      return getMockTriageResult(input);
    }

    try {
      const assessment = await analyzeSymptoms(input);
      const { product_hold, unvalidated_banner, ...row } = assessment;

      const { data, error } = await supabase
        .from('triage_assessments')
        .insert(row as any)
        .select()
        .single();

      if (error) throw error;
      const saved = data as unknown as TriageAssessment;
      return {
        ...saved,
        product_hold,
        unvalidated_banner,
      };
    } catch (error) {
      console.error('Triage error:', error);
      throw error;
    }
  },

  /**
   * Get triage history for patient
   */
  async getTriageHistory(patientId: string): Promise<TriageAssessment[]> {
    const enabled = isClinicalTriageEnabled();

    if (USE_MOCK_DATA) {
      return [redactClinicalTriage(getMockTriageResult({
        patient_id: patientId,
        patient_name: 'Mock Patient',
        symptoms: ['fever', 'headache'],
        symptom_text: 'Mgonjwa ana homa na maumivu ya kichwa',
        language: 'sw',
        created_by: 'nurse-1',
      }), enabled)];
    }

    const { data, error } = await supabase
      .from('triage_assessments')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const rows = (data ?? []) as unknown as TriageAssessment[];
    return rows.map((row) =>
      redactClinicalTriage(
        {
          ...row,
          possible_conditions: row.possible_conditions ?? [],
          product_hold: false,
          unvalidated_banner: enabled ? { ...UNVALIDATED_TRIAGE_BANNER } : null,
        },
        enabled,
      ),
    );
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

async function analyzeSymptoms(input: TriageInput): Promise<TriageAssessment> {
  if (!isClinicalTriageEnabled()) {
    return heldTriageAssessment(input);
  }

  const symptomsText = input.symptoms.join(', ') + (input.symptom_text ? `. ${input.symptom_text}` : '');

  const vitals = input.vitals ? {
    temp: input.vitals.temperature,
    heartRate: input.vitals.heart_rate,
    bloodPressure: input.vitals.blood_pressure
  } : undefined;

  const localResult = await performLocalTriage(symptomsText, vitals);
  if (localResult.productHold || localResult.level == null) {
    return heldTriageAssessment(input);
  }

  return deriveTriageAssessment(input, {
    level: localResult.level,
    recommendation: localResult.recommendation,
    reasoning: localResult.reasoning,
  }, true);
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
    risk_score: 40,
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
    product_hold: false,
    unvalidated_banner: { ...UNVALIDATED_TRIAGE_BANNER },
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
