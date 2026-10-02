-- CRE-13: keep urgent and emergency distinct from legacy 'high'.
-- Do not run this against production as part of opening the PR.
-- Existing 'high' rows stay valid. 'high' is not a synonym for urgent or emergency.

ALTER TABLE patient_queue DROP CONSTRAINT IF EXISTS patient_queue_risk_level_check;
ALTER TABLE patient_queue ADD CONSTRAINT patient_queue_risk_level_check
  CHECK (risk_level IN ('low', 'medium', 'high', 'urgent', 'emergency'));

ALTER TABLE maternal_care DROP CONSTRAINT IF EXISTS maternal_care_risk_level_check;
ALTER TABLE maternal_care ADD CONSTRAINT maternal_care_risk_level_check
  CHECK (risk_level IN ('low', 'medium', 'high', 'urgent', 'emergency'));
