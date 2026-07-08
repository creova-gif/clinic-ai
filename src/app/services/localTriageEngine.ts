import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use local paths if needed, or disable remote models if strictly offline.
// In a real offline app, you'd download the model weights and set env.localModelPath.
env.allowLocalModels = false;
env.useBrowserCache = true;

let classifier: any = null;

/**
 * Initialize the local AI model for triage.
 * We use a small zero-shot classification model suitable for browser/WebAssembly.
 */
export async function initLocalTriageModel() {
  if (!classifier) {
    // We use a small zero-shot classification model for triage
    classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
  }
  return classifier;
}

export interface TriageResult {
  level: 'emergency' | 'urgent' | 'moderate' | 'mild';
  confidence: 'high' | 'medium' | 'low';
  recommendation: string;
  reasoning: string[];
  redFlags: string[];
  escalationRequired: boolean;
  callEmergency: boolean;
}

/**
 * Perform local triage based on symptoms and vitals.
 */
export async function performLocalTriage(
  symptoms: string,
  vitals?: { temp?: number; heartRate?: number; bloodPressure?: string }
): Promise<TriageResult> {
  const model = await initLocalTriageModel();

  const labels = ['emergency', 'urgent', 'moderate', 'mild'];
  const text = \`Patient symptoms: \${symptoms}. \${
    vitals ? \`Vitals: Temp \${vitals.temp}C, HR \${vitals.heartRate}bpm, BP \${vitals.bloodPressure}\` : ''
  }\`;

  const result = await model(text, labels);

  // result.labels[0] is the most likely label
  const topLabel = result.labels[0] as 'emergency' | 'urgent' | 'moderate' | 'mild';
  const topScore = result.scores[0];

  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (topScore > 0.8) confidence = 'high';
  else if (topScore > 0.5) confidence = 'medium';

  const redFlags = [];
  if (symptoms.toLowerCase().includes('chest pain') || symptoms.toLowerCase().includes('bleeding')) {
    redFlags.push('Critical symptom detected');
  }

  let recommendation = 'Please monitor your symptoms.';
  if (topLabel === 'emergency') recommendation = 'Seek immediate emergency medical care.';
  if (topLabel === 'urgent') recommendation = 'Visit the clinic as soon as possible.';

  return {
    level: topLabel,
    confidence,
    recommendation,
    reasoning: [
      \`Model classified as \${topLabel} with \${Math.round(topScore * 100)}% confidence.\`
    ],
    redFlags,
    escalationRequired: topLabel === 'emergency' || topLabel === 'urgent',
    callEmergency: topLabel === 'emergency'
  };
}
