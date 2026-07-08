/**
 * ClinicalTriageEngine - AI-Powered Generative Triage Engine
 * 
 * SAFETY STANDARD: Evidence-based clinical decision support
 * Powered by Firebase AI Logic (Gemini 2.5 Flash)
 * 
 * Replaces legacy static decision trees with an LLM OS layer
 * that reasons over the patient's entire unstructured transcript.
 */

import { getTriageModel } from '../services/firebaseAI';
import { supabase } from '../services/supabase';

export interface SymptomAnswer {
  questionId: string;
  answer: boolean | string;
  timestamp: Date;
  severity?: number;
}

export interface TriageResult {
  level: 'emergency' | 'urgent' | 'moderate' | 'mild';
  confidence: 'high' | 'medium' | 'low'; 
  recommendation: string;
  reasoning: string[];
  redFlags: string[];
  escalationRequired: boolean;
  callEmergency: boolean;
  nearestFacility?: string;
  auditId?: string;
  disclaimers?: string[];
}

export class ClinicalTriageEngine {
  
  /**
   * Perform clinical triage assessment using Gemini AI
   */
  static async assessSymptomsWithAI(
    chatTranscript: string,
    language: 'sw' | 'en'
  ): Promise<TriageResult> {
    
    // Create the system prompt enforcing WHO guidelines
    const systemInstruction = `
      You are a clinical triage reasoning engine following WHO IMAI and Tanzania National Guidelines.
      Analyze the following patient chat transcript and determine the triage level.
      Output strictly the JSON schema requested.
      Language preference for recommendation: ${language}
      
      CRITICAL EMERGENCY EXAMPLES: chest pain, difficulty breathing, coughing blood, unconsciousness, severe bleeding.
      If emergency, set callEmergency to true.
    `;

    const model = getTriageModel();
    
    try {
      const response = await model.generateContent([
        { text: systemInstruction },
        { text: `Patient Transcript:\n${chatTranscript}` }
      ]);
      
      const responseText = response.response.text();
      const resultData = JSON.parse(responseText) as TriageResult;
      
      // Inject standard disclaimers post-generation
      resultData.disclaimers = this.getDisclaimers(language, resultData.level);
      resultData.nearestFacility = 'Mwananyamala Hospital - 2.3 km'; // Mocked for now
      resultData.auditId = `triage_ai_${Date.now()}`;
      
      return resultData;
      
    } catch (error) {
      console.error("AI Triage Error, falling back to safe defaults", error);
      // Fail safe
      return this.getFallbackResult(language);
    }
  }

  /**
   * Log triage assessment to the new closed loop feedback table
   */
  static async logAssessmentToFeedbackLoop(
    assessmentId: string,
    aiResult: TriageResult,
    actualDiagnosis: string,
    actualSeverity: string,
    clinicianId: string,
    estimatedTokens: number
  ): Promise<void> {
    try {
      await supabase.from('triage_outcomes_feedback').insert({
        symptom_assessment_id: assessmentId,
        ai_triage_level: aiResult.level,
        ai_reasoning: JSON.stringify(aiResult.reasoning),
        actual_diagnosis: actualDiagnosis,
        actual_severity: actualSeverity,
        clinician_id: clinicianId,
        token_usage_estimated: estimatedTokens
      });
      console.log("Feedback loop updated successfully");
    } catch (e) {
      console.error("Failed to write to closed loop", e);
    }
  }

  private static getFallbackResult(language: 'sw' | 'en'): TriageResult {
    return {
      level: 'urgent',
      confidence: 'low',
      recommendation: language === 'sw' ? 'Tafadhali onana na daktari mara moja.' : 'Please see a doctor immediately.',
      reasoning: ['System error occurred. Defaulting to safe urgent recommendation.'],
      redFlags: ['System Failure'],
      escalationRequired: true,
      callEmergency: false,
      disclaimers: this.getDisclaimers(language, 'urgent')
    };
  }

  private static getDisclaimers(language: 'sw' | 'en', level: string): string[] {
    const disclaimers = {
      sw: {
        common: [
          '⚠️ Hii ni ushauri wa awali uliozalishwa na AI, sio uchunguzi wa matibabu.',
          '⚠️ Tathmini hii inahitaji kuthibitishwa na mtaalamu wa afya.',
        ],
        emergency: ['🚨 Kwa dharura, piga 114 bila kuchelewa.'],
      },
      en: {
        common: [
          '⚠️ This is an AI-generated preliminary guidance, not a medical diagnosis.',
          '⚠️ This assessment must be validated by a healthcare professional.',
        ],
        emergency: ['🚨 For emergencies, call 114 without delay.'],
      },
    };
    
    const result = [...disclaimers[language].common];
    if (level === 'emergency' || level === 'urgent') {
      result.push(...disclaimers[language].emergency);
    }
    return result;
  }
}
