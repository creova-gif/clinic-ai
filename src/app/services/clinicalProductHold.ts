/**
 * CRE-13 product hold for clinic-ai triage.
 *
 * Clinical triage output is off unless a supervised pilot or demo opts in.
 * A missing or any non-exact value is off. urgent and emergency stay distinct
 * and are never stored as the same 'high' level.
 */

export const PRODUCT_HOLD_NOTICE = {
  en: 'Not for clinical use: under product hold',
  sw: 'Si kwa matumizi ya kliniki: kizuizi cha bidhaa',
} as const;

export const UNVALIDATED_TRIAGE_BANNER = {
  en: 'Unvalidated: decision support only, not a diagnosis; follow local clinical protocols and refer when in doubt',
  sw: 'Haijathibitishwa: msaada wa maamuzi tu, si utambuzi; fuata itifaki za kliniki za eneo na toa rufaa unapokuwa na shaka',
} as const;

export type LocalTriageLevel = 'emergency' | 'urgent' | 'moderate' | 'mild';

/** Levels written by new triage assessments. */
export type TriageRiskLevel = 'low' | 'medium' | 'urgent' | 'emergency';

/**
 * Persisted risk_level. 'high' remains valid for existing rows.
 * New triage output must not write 'high' for urgent or for emergency.
 */
export type RiskLevel = TriageRiskLevel | 'high';

export interface ClinicalTriageEnv {
  VITE_CLINICAL_TRIAGE_ENABLED?: string;
}

export interface TriageAssessmentVitals {
  temperature?: number;
  blood_pressure?: string;
  heart_rate?: number;
  oxygen_saturation?: number;
}

export interface TriageAssessmentInput {
  patient_id: string;
  patient_name: string;
  symptoms: string[];
  symptom_text: string;
  language: 'sw' | 'en';
  vitals?: TriageAssessmentVitals;
  created_by: string;
}

export interface TriageAssessment {
  id: string;
  patient_id: string;
  patient_name: string;
  symptoms: string[];
  symptom_text: string;
  language: 'sw' | 'en';
  risk_level: RiskLevel | null;
  risk_score: number | null;
  suggested_action: string;
  possible_conditions: string[];
  care_pathway: string;
  vitals?: TriageAssessmentVitals;
  created_at: string;
  created_by: string;
  product_hold: boolean;
  unvalidated_banner: { en: string; sw: string } | null;
}

export interface LocalTriageSummary {
  level: LocalTriageLevel;
  recommendation: string;
  reasoning: string[];
}

interface Stamp {
  id: string;
  created_at: string;
}

function readViteFlag(): string | undefined {
  const env = (import.meta as { env?: ClinicalTriageEnv }).env;
  return env?.VITE_CLINICAL_TRIAGE_ENABLED;
}

/** True only when the flag is the exact string "true". */
export function isClinicalTriageEnabled(env?: ClinicalTriageEnv): boolean {
  const value = env ? env.VITE_CLINICAL_TRIAGE_ENABLED : readViteFlag();
  return value === 'true';
}

export type UssdRiskLevel = 'LOW' | 'URGENT' | 'EMERGENCY';

/** USSD tree: life-threatening findings are emergency; clinic-soon findings are urgent. */
export function classifyUssdRisk(session: {
  ageGroup?: string;
  pregnancy?: boolean;
  symptom?: string;
  dangerSign?: string;
  consciousness?: string;
}): UssdRiskLevel {
  const { ageGroup, pregnancy, symptom, dangerSign, consciousness } = session;
  const isChildUnder5 = ageGroup === '1';
  const isFever = symptom === '1';
  const feverLong = dangerSign === '3';
  const breathingSevere = symptom === '2' && dangerSign === '1';
  const bleedingHeavy = symptom === '5' && dangerSign === '2';
  const unconscious = consciousness === '3';
  const severePain = symptom === '3' && dangerSign === '1';
  const pregnantBleeding = Boolean(pregnancy && symptom === '5');

  if (breathingSevere || unconscious || bleedingHeavy || pregnantBleeding) {
    return 'EMERGENCY';
  }

  if (
    (isChildUnder5 && isFever && feverLong) ||
    (pregnancy && severePain) ||
    (isFever && dangerSign === '2') ||
    severePain ||
    (symptom === '4' && consciousness === '2')
  ) {
    return 'URGENT';
  }

  return 'LOW';
}

export function mapLocalTriageLevel(level: LocalTriageLevel): TriageRiskLevel {
  switch (level) {
    case 'emergency':
      return 'emergency';
    case 'urgent':
      return 'urgent';
    case 'moderate':
      return 'medium';
    case 'mild':
      return 'low';
  }
}

function riskScoreFor(level: LocalTriageLevel): number {
  switch (level) {
    case 'emergency':
      return 90;
    case 'urgent':
      return 70;
    case 'moderate':
      return 40;
    case 'mild':
      return 10;
  }
}

/** Keyword suggestions. Call only when clinical triage is explicitly enabled. */
export function suggestPossibleConditions(symptomsText: string): string[] {
  const possibleConditions: string[] = [];
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

  return possibleConditions;
}

function defaultStamp(): Stamp {
  return {
    id: 'triage-' + Date.now(),
    created_at: new Date().toISOString(),
  };
}

function symptomText(input: TriageAssessmentInput): string {
  return input.symptoms.join(', ') + (input.symptom_text ? `. ${input.symptom_text}` : '');
}

export function heldTriageAssessment(
  input: TriageAssessmentInput,
  stamp: Stamp = defaultStamp(),
): TriageAssessment {
  return {
    id: stamp.id,
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    symptoms: input.symptoms,
    symptom_text: input.symptom_text,
    language: input.language,
    risk_level: null,
    risk_score: null,
    suggested_action: PRODUCT_HOLD_NOTICE.en,
    possible_conditions: [],
    care_pathway: `${PRODUCT_HOLD_NOTICE.en}\n${PRODUCT_HOLD_NOTICE.sw}`,
    vitals: input.vitals,
    created_at: stamp.created_at,
    created_by: input.created_by,
    product_hold: true,
    unvalidated_banner: null,
  };
}

/**
 * Build a triage assessment. When `enabled` is false, risk levels and
 * possible-condition suggestions are not produced.
 */
export function deriveTriageAssessment(
  input: TriageAssessmentInput,
  local: LocalTriageSummary,
  enabled: boolean,
  stamp: Stamp = defaultStamp(),
): TriageAssessment {
  if (!enabled) {
    return heldTriageAssessment(input, stamp);
  }

  const text = symptomText(input);
  return {
    id: stamp.id,
    patient_id: input.patient_id,
    patient_name: input.patient_name,
    symptoms: input.symptoms,
    symptom_text: input.symptom_text,
    language: input.language,
    risk_level: mapLocalTriageLevel(local.level),
    risk_score: riskScoreFor(local.level),
    suggested_action: local.recommendation,
    possible_conditions: suggestPossibleConditions(text),
    care_pathway: `${local.recommendation} ${local.reasoning.join('. ')}`.trim(),
    vitals: input.vitals,
    created_at: stamp.created_at,
    created_by: input.created_by,
    product_hold: false,
    unvalidated_banner: { ...UNVALIDATED_TRIAGE_BANNER },
  };
}

/** Strip clinical fields from a stored assessment while the hold is on. */
export function redactClinicalTriage<T extends TriageAssessment>(
  assessment: T,
  enabled: boolean,
): T {
  if (enabled) return assessment;
  return {
    ...assessment,
    risk_level: null,
    risk_score: null,
    possible_conditions: [],
    suggested_action: PRODUCT_HOLD_NOTICE.en,
    care_pathway: `${PRODUCT_HOLD_NOTICE.en}\n${PRODUCT_HOLD_NOTICE.sw}`,
    product_hold: true,
    unvalidated_banner: null,
  };
}
