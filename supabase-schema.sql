-- ============================================
-- AfyaCare Tanzania - Supabase Database Schema
-- Version: 1.0.0
-- Date: February 23, 2026
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase project
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Run the script
-- 5. Enable Row Level Security policies (see below)
--
-- TABLES:
-- - users (auth handled by Supabase Auth)
-- - appointments
-- - medications
-- - test_results
-- - facilities
-- - symptom_assessments
-- - maternal_care
-- - offline_queue
-- - audit_logs
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: appointments
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  facility_id UUID NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  reason TEXT,
  notes TEXT,
  has_insurance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_facility_id ON appointments(facility_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: user_roles
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'clinician', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Updated_at trigger
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: medications
-- ============================================
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  reminder_times TEXT[] NOT NULL,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(active);
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON medications(start_date);

-- Updated_at trigger
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: test_results
-- ============================================
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  facility_id UUID NOT NULL,
  test_type TEXT NOT NULL,
  test_date DATE NOT NULL,
  results JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'reviewed')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_facility_id ON test_results(facility_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_date ON test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status);

-- Updated_at trigger
CREATE TRIGGER update_test_results_updated_at BEFORE UPDATE ON test_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: facilities
-- ============================================
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_sw TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital', 'health_center', 'dispensary', 'clinic')),
  address TEXT NOT NULL,
  address_sw TEXT NOT NULL,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  phone TEXT,
  services TEXT[] NOT NULL,
  operating_hours JSONB,
  current_load TEXT CHECK (current_load IN ('low', 'medium', 'high')),
  wait_time_minutes INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_facilities_region ON facilities(region);
CREATE INDEX IF NOT EXISTS idx_facilities_district ON facilities(district);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities(type);
CREATE INDEX IF NOT EXISTS idx_facilities_active ON facilities(active);
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities(latitude, longitude);

-- Updated_at trigger
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: symptom_assessments
-- ============================================
CREATE TABLE IF NOT EXISTS symptom_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  session_id TEXT NOT NULL,
  symptoms JSONB NOT NULL,
  triage_result JSONB NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('sw', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_symptom_assessments_user_id ON symptom_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_assessments_session_id ON symptom_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_symptom_assessments_created_at ON symptom_assessments(created_at);

-- ============================================
-- TABLE: maternal_care
-- ============================================
CREATE TABLE IF NOT EXISTS maternal_care (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  pregnancy_start_date DATE NOT NULL,
  estimated_due_date DATE NOT NULL,
  current_week INTEGER NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  vital_signs JSONB[] NOT NULL DEFAULT '{}',
  checkups JSONB[] NOT NULL DEFAULT '{}',
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_maternal_care_user_id ON maternal_care(user_id);
CREATE INDEX IF NOT EXISTS idx_maternal_care_active ON maternal_care(active);
CREATE INDEX IF NOT EXISTS idx_maternal_care_estimated_due_date ON maternal_care(estimated_due_date);

-- Updated_at trigger
CREATE TRIGGER update_maternal_care_updated_at BEFORE UPDATE ON maternal_care
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: offline_queue
-- ============================================
CREATE TABLE IF NOT EXISTS offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  table_name TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'synced', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id ON offline_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status);
CREATE INDEX IF NOT EXISTS idx_offline_queue_created_at ON offline_queue(created_at);

-- ============================================
-- TABLE: audit_logs
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- ROLE CHECK FUNCTIONS (SECURITY DEFINER)
-- ============================================
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid()::text AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_clinician() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid()::text AND role IN ('clinician', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- 
-- CRITICAL: Enable RLS on all tables to prevent unauthorized access
-- Users can only see/modify their own data
-- 
-- NOTE: For development, you can disable RLS temporarily, but
-- ALWAYS enable it in production!
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maternal_care ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: user_roles
-- ============================================
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (is_admin());

-- ============================================
-- RLS POLICIES: appointments
-- ============================================
CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own appointments"
  ON appointments FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================
-- RLS POLICIES: medications
-- ============================================
CREATE POLICY "Users can view their own medications"
  ON medications FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own medications"
  ON medications FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own medications"
  ON medications FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================
-- RLS POLICIES: test_results
-- ============================================
CREATE POLICY "Users can view their own test results"
  ON test_results FOR SELECT
  USING (auth.uid()::text = user_id);

-- Only clinicians can create test results (add role check in production)
CREATE POLICY "Clinicians can create test results"
  ON test_results FOR INSERT
  WITH CHECK (is_clinician());

CREATE POLICY "Clinicians can update test results"
  ON test_results FOR UPDATE
  USING (is_clinician());

-- ============================================
-- RLS POLICIES: facilities
-- ============================================
-- Facilities are public read-only
CREATE POLICY "Anyone can view active facilities"
  ON facilities FOR SELECT
  USING (active = true);

-- Only admins can modify facilities
CREATE POLICY "Admins can modify facilities"
  ON facilities FOR ALL
  USING (is_admin());

-- ============================================
-- RLS POLICIES: symptom_assessments
-- ============================================
CREATE POLICY "Users can view their own assessments"
  ON symptom_assessments FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create symptom assessments"
  ON symptom_assessments FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================
-- RLS POLICIES: maternal_care
-- ============================================
CREATE POLICY "Users can view their own maternal care records"
  ON maternal_care FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own maternal care records"
  ON maternal_care FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own maternal care records"
  ON maternal_care FOR UPDATE
  USING (auth.uid()::text = user_id);

-- ============================================
-- RLS POLICIES: offline_queue
-- ============================================
-- Offline queue is user-specific
CREATE POLICY "Users can manage their own offline queue"
  ON offline_queue FOR ALL
  USING (auth.uid()::text = user_id);

-- ============================================
-- RLS POLICIES: audit_logs
-- ============================================
-- Audit logs are append-only
CREATE POLICY "Users can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

-- ============================================
-- SEED DATA: Sample Facilities
-- ============================================
-- Add some initial facilities for testing
INSERT INTO facilities (name, name_sw, type, address, address_sw, region, district, latitude, longitude, phone, services, active) VALUES
  ('Muhimbili National Hospital', 'Hospitali ya Taifa ya Muhimbili', 'hospital', 'United Nations Road, Ilala, Dar es Salaam', 'Barabara ya Umoja wa Mataifa, Ilala, Dar es Salaam', 'Dar es Salaam', 'Ilala', -6.7896, 39.2611, '+255 22 215 0302', ARRAY['Emergency', 'Outpatient', 'Inpatient', 'Surgery', 'Maternity', 'Laboratory', 'Radiology', 'Pharmacy'], true),
  ('Mwananyamala Regional Referral Hospital', 'Hospitali ya Rufaa ya Mkoa wa Mwananyamala', 'hospital', 'Mwananyamala, Kinondoni, Dar es Salaam', 'Mwananyamala, Kinondoni, Dar es Salaam', 'Dar es Salaam', 'Kinondoni', -6.7721, 39.2298, '+255 22 2700 146', ARRAY['Emergency', 'Maternity', 'Outpatient', 'Laboratory', 'Pharmacy'], true),
  ('Temeke Regional Referral Hospital', 'Hospitali ya Rufaa ya Mkoa wa Temeke', 'hospital', 'Chang''ombe, Temeke, Dar es Salaam', 'Chang''ombe, Temeke, Dar es Salaam', 'Dar es Salaam', 'Temeke', -6.8384, 39.2758, '+255 22 2862 515', ARRAY['Emergency', 'Outpatient', 'Maternity', 'Laboratory'], true),
  ('Amana Regional Referral Hospital', 'Hospitali ya Rufaa ya Mkoa wa Amana', 'hospital', 'Amana, Ilala, Dar es Salaam', 'Amana, Ilala, Dar es Salaam', 'Dar es Salaam', 'Ilala', -6.8167, 39.2833, '+255 22 2860 441', ARRAY['Emergency', 'Outpatient', 'Surgery', 'Laboratory', 'Pharmacy'], true),
  ('Mwananyamala Dispensary', 'Zahanati ya Mwananyamala', 'dispensary', 'Mwananyamala, Kinondoni, Dar es Salaam', 'Mwananyamala, Kinondoni, Dar es Salaam', 'Dar es Salaam', 'Kinondoni', -6.7650, 39.2250, '+255 22 2700 555', ARRAY['Outpatient', 'Immunization', 'Family Planning', 'Pharmacy'], true)
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS: Helpful utilities
-- ============================================

-- Function to clean up old audit logs (run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_appointments', (SELECT COUNT(*) FROM appointments WHERE user_id = p_user_id),
    'active_medications', (SELECT COUNT(*) FROM medications WHERE user_id = p_user_id AND active = true),
    'test_results', (SELECT COUNT(*) FROM test_results WHERE user_id = p_user_id),
    'recent_assessments', (SELECT COUNT(*) FROM symptom_assessments WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '30 days')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLE: chw_profiles
-- ============================================
CREATE TABLE IF NOT EXISTS chw_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  languages TEXT[] NOT NULL DEFAULT '{"sw", "en"}',
  active BOOLEAN DEFAULT TRUE,
  current_location JSONB, 
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: chw_dispatch_tasks
-- ============================================
CREATE TABLE IF NOT EXISTS chw_dispatch_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chw_id UUID NOT NULL REFERENCES chw_profiles(id),
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  patient_location JSONB, 
  triage_level TEXT NOT NULL,
  reasoning TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'en_route', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chw_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chw_dispatch_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active chw_profiles"
  ON chw_profiles FOR SELECT
  USING (active = true);

CREATE POLICY "Clinicians can manage chw_dispatch_tasks"
  ON chw_dispatch_tasks FOR ALL
  USING (is_clinician() OR is_admin());

-- ============================================
-- TABLE: ai_telemetry
-- ============================================
CREATE TABLE IF NOT EXISTS ai_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID,
  original_level TEXT,
  actual_outcome TEXT,
  feedback_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

ALTER TABLE ai_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can insert and view ai_telemetry"
  ON ai_telemetry FOR ALL
  USING (is_clinician() OR is_admin());

INSERT INTO chw_profiles (id, user_id, name, languages, active, current_location) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'chw-user-1', 'Asha Suleiman', ARRAY['sw', 'en'], true, '{"lat": -6.79, "lng": 39.20}'),
  ('22222222-2222-2222-2222-222222222222', 'chw-user-2', 'John Mushi', ARRAY['sw'], true, '{"lat": -6.81, "lng": 39.28}')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ AfyaCare Tanzania database schema created successfully!';
  RAISE NOTICE '📊 Tables created: appointments, medications, test_results, facilities, symptom_assessments, maternal_care, offline_queue, audit_logs, chw_profiles, chw_dispatch_tasks';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '🌱 Sample facilities seeded';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NEXT STEPS:';
  RAISE NOTICE '1. Review RLS policies and add role-based checks';
  RAISE NOTICE '2. Set up Supabase Auth';
  RAISE NOTICE '3. Copy your project URL and anon key to .env';
  RAISE NOTICE '4. Test the API endpoints';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready for deployment!';
END $$;
