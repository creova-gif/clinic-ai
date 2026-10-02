import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyUssdRisk,
  deriveTriageAssessment,
  heldTriageAssessment,
  isClinicalTriageEnabled,
  mapLocalTriageLevel,
  PRODUCT_HOLD_NOTICE,
  redactClinicalTriage,
  suggestPossibleConditions,
  UNVALIDATED_TRIAGE_BANNER,
  type TriageAssessment,
  type TriageAssessmentInput,
} from './clinicalProductHold.ts';

const stamp = { id: 'triage-test', created_at: '2026-10-02T00:00:00.000Z' };

const feverHeadache: TriageAssessmentInput = {
  patient_id: 'p-1',
  patient_name: 'Test Patient',
  symptoms: ['fever', 'headache'],
  symptom_text: 'homa na maumivu ya kichwa',
  language: 'sw',
  created_by: 'chw-1',
};

const local = {
  recommendation: 'Seek immediate emergency medical care.',
  reasoning: ['Model classified as emergency with 91% confidence.'],
};

describe('clinical triage product hold', () => {
  it('is off unless the flag is exactly true', () => {
    assert.equal(isClinicalTriageEnabled({}), false);
    assert.equal(isClinicalTriageEnabled({ VITE_CLINICAL_TRIAGE_ENABLED: undefined }), false);
    assert.equal(isClinicalTriageEnabled({ VITE_CLINICAL_TRIAGE_ENABLED: '' }), false);
    assert.equal(isClinicalTriageEnabled({ VITE_CLINICAL_TRIAGE_ENABLED: 'false' }), false);
    assert.equal(isClinicalTriageEnabled({ VITE_CLINICAL_TRIAGE_ENABLED: 'TRUE' }), false);
    assert.equal(isClinicalTriageEnabled({ VITE_CLINICAL_TRIAGE_ENABLED: '1' }), false);
    assert.equal(isClinicalTriageEnabled({ VITE_CLINICAL_TRIAGE_ENABLED: 'true' }), true);
  });

  it('does not produce risk levels or possible conditions when the hold is on', () => {
    const held = deriveTriageAssessment(
      feverHeadache,
      { ...local, level: 'emergency' },
      false,
      stamp,
    );

    assert.equal(held.product_hold, true);
    assert.equal(held.risk_level, null);
    assert.equal(held.risk_score, null);
    assert.deepEqual(held.possible_conditions, []);
    assert.equal(held.unvalidated_banner, null);
    assert.equal(held.suggested_action, PRODUCT_HOLD_NOTICE.en);
    assert.match(held.care_pathway, /Not for clinical use: under product hold/);
    assert.match(held.care_pathway, /Si kwa matumizi ya kliniki/);

    const serialized = JSON.stringify(held);
    assert.equal(serialized.includes('Malaria'), false);
    assert.equal(serialized.includes('Typhoid'), false);
    assert.equal(serialized.includes('Cholera'), false);
    assert.equal(serialized.includes('emergency'), false);
    assert.equal(serialized.includes('urgent'), false);
  });

  it('redacts stored clinical output while the hold is on', () => {
    const stored: TriageAssessment = {
      ...heldTriageAssessment(feverHeadache, stamp),
      product_hold: false,
      risk_level: 'emergency',
      risk_score: 90,
      possible_conditions: ['Malaria', 'Typhoid'],
      suggested_action: 'Seek immediate emergency medical care.',
      care_pathway: 'Possible malaria. Refer now.',
      unvalidated_banner: { ...UNVALIDATED_TRIAGE_BANNER },
    };

    const redacted = redactClinicalTriage(stored, false);
    assert.equal(redacted.risk_level, null);
    assert.deepEqual(redacted.possible_conditions, []);
    assert.equal(redacted.product_hold, true);
    assert.equal(JSON.stringify(redacted).includes('Malaria'), false);

    const shown = redactClinicalTriage(stored, true);
    assert.equal(shown.risk_level, 'emergency');
    assert.deepEqual(shown.possible_conditions, ['Malaria', 'Typhoid']);
  });
});

describe('urgent and emergency stay distinct', () => {
  it('maps each local level to its own risk level', () => {
    assert.equal(mapLocalTriageLevel('emergency'), 'emergency');
    assert.equal(mapLocalTriageLevel('urgent'), 'urgent');
    assert.equal(mapLocalTriageLevel('moderate'), 'medium');
    assert.equal(mapLocalTriageLevel('mild'), 'low');
    assert.notEqual(mapLocalTriageLevel('emergency'), mapLocalTriageLevel('urgent'));
    assert.notEqual(mapLocalTriageLevel('emergency'), 'high');
    assert.notEqual(mapLocalTriageLevel('urgent'), 'high');
  });

  it('does not collapse urgent and emergency into high when triage is enabled', () => {
    const emergency = deriveTriageAssessment(
      feverHeadache,
      { ...local, level: 'emergency' },
      true,
      stamp,
    );
    const urgent = deriveTriageAssessment(
      feverHeadache,
      {
        level: 'urgent',
        recommendation: 'Visit the clinic as soon as possible.',
        reasoning: ['Model classified as urgent with 70% confidence.'],
      },
      true,
      { ...stamp, id: 'triage-urgent' },
    );

    assert.equal(emergency.risk_level, 'emergency');
    assert.equal(urgent.risk_level, 'urgent');
    assert.notEqual(emergency.risk_level, urgent.risk_level);
    assert.notEqual(emergency.risk_level, 'high');
    assert.notEqual(urgent.risk_level, 'high');
    assert.equal(emergency.risk_score, 90);
    assert.equal(urgent.risk_score, 70);
    assert.equal(emergency.product_hold, false);
    assert.equal(emergency.unvalidated_banner?.en, UNVALIDATED_TRIAGE_BANNER.en);
    assert.match(emergency.unvalidated_banner?.sw ?? '', /Haijathibitishwa/);

    const conditions = suggestPossibleConditions('fever and headache');
    assert.ok(conditions.includes('Malaria'));
    assert.deepEqual(emergency.possible_conditions, conditions);
  });

  it('classifies USSD emergency and urgent as different levels', () => {
    const emergency = classifyUssdRisk({ consciousness: '3' });
    const urgent = classifyUssdRisk({ symptom: '3', dangerSign: '1' });
    const bleeding = classifyUssdRisk({ symptom: '5', dangerSign: '2' });

    assert.equal(emergency, 'EMERGENCY');
    assert.equal(bleeding, 'EMERGENCY');
    assert.equal(urgent, 'URGENT');
    assert.notEqual(emergency, urgent);
    assert.notEqual(emergency, 'HIGH');
    assert.notEqual(urgent, 'HIGH');
    assert.equal(classifyUssdRisk({ symptom: '1' }), 'LOW');
  });
});
