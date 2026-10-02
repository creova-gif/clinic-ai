const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const {
  classifyUssdRisk,
  holdMessage,
  isClinicalTriageEnabled,
  PRODUCT_HOLD_NOTICE,
} = require('./clinicalProductHold.cjs');

describe('ussd product hold', () => {
  it('is off unless CLINICAL_TRIAGE_ENABLED is exactly true', () => {
    assert.equal(isClinicalTriageEnabled({}), false);
    assert.equal(isClinicalTriageEnabled({ CLINICAL_TRIAGE_ENABLED: 'false' }), false);
    assert.equal(isClinicalTriageEnabled({ CLINICAL_TRIAGE_ENABLED: 'true' }), true);
  });

  it('hold message has no risk level or condition', () => {
    const message = holdMessage();
    assert.match(message, /Not for clinical use: under product hold/);
    assert.match(message, /Si kwa matumizi ya kliniki/);
    assert.equal(message.includes('Malaria'), false);
    assert.equal(message.includes('HIGH'), false);
    assert.equal(PRODUCT_HOLD_NOTICE.en, 'Not for clinical use: under product hold');
  });

  it('keeps emergency and urgent distinct', () => {
    assert.equal(classifyUssdRisk({ consciousness: '3' }), 'EMERGENCY');
    assert.equal(classifyUssdRisk({ symptom: '5', dangerSign: '2' }), 'EMERGENCY');
    assert.equal(classifyUssdRisk({ pregnancy: true, symptom: '5' }), 'EMERGENCY');
    assert.equal(classifyUssdRisk({ symptom: '3', dangerSign: '1' }), 'URGENT');
    assert.equal(classifyUssdRisk({ ageGroup: '1', symptom: '1', dangerSign: '3' }), 'URGENT');
    assert.notEqual(
      classifyUssdRisk({ consciousness: '3' }),
      classifyUssdRisk({ symptom: '4', consciousness: '2' }),
    );
    assert.equal(classifyUssdRisk({ symptom: '1' }), 'LOW');
  });
});
