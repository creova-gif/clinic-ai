/**
 * Server-side product hold. Keep the English and Swahili strings in sync with
 * src/app/services/clinicalProductHold.ts.
 *
 * Off unless CLINICAL_TRIAGE_ENABLED is exactly "true".
 * CommonJS so the USSD server can load it from an ESM package.
 */

const PRODUCT_HOLD_NOTICE = {
  en: 'Not for clinical use: under product hold',
  sw: 'Si kwa matumizi ya kliniki: kizuizi cha bidhaa',
};

const UNVALIDATED_TRIAGE_BANNER = {
  en: 'Unvalidated: decision support only, not a diagnosis; follow local clinical protocols and refer when in doubt',
  sw: 'Haijathibitishwa: msaada wa maamuzi tu, si utambuzi; fuata itifaki za kliniki za eneo na toa rufaa unapokuwa na shaka',
};

function isClinicalTriageEnabled(env = process.env) {
  return env.CLINICAL_TRIAGE_ENABLED === 'true';
}

/**
 * Life-threatening findings are emergency. Clinic-soon findings are urgent.
 * Neither value is 'HIGH'.
 */
function classifyUssdRisk(session) {
  const { ageGroup, pregnancy, symptom, dangerSign, consciousness } = session;

  const isChildUnder5 = ageGroup === '1';
  const isFever = symptom === '1';
  const feverLong = dangerSign === '3';
  const breathingSevere = symptom === '2' && dangerSign === '1';
  const bleedingHeavy = symptom === '5' && dangerSign === '2';
  const unconscious = consciousness === '3';
  const severePain = symptom === '3' && dangerSign === '1';
  const pregnantBleeding = pregnancy && symptom === '5';

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

function holdMessage() {
  return `${PRODUCT_HOLD_NOTICE.en}\n${PRODUCT_HOLD_NOTICE.sw}`;
}

module.exports = {
  PRODUCT_HOLD_NOTICE,
  UNVALIDATED_TRIAGE_BANNER,
  isClinicalTriageEnabled,
  classifyUssdRisk,
  holdMessage,
};
