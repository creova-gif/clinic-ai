/**
 * AfyaCare Tanzania - Extended Database Schema
 * 
 * WELLNESS MODULE & PATIENT QUEUE MANAGEMENT
 * 
 * This extends the base schema with:
 * 1. Wellness tracking (nutrition, habits, workouts, family profiles)
 * 2. Patient queue management (hospital workflow)
 * 3. Clinical documentation
 * 
 * DEPLOYMENT:
 * 1. Run this in Supabase SQL Editor after base schema
 * 2. Enable RLS policies
 * 3. Grant appropriate permissions
 */

-- ============================================================================
-- WELLNESS MODULE TABLES
-- ============================================================================

-- Wellness Profiles (user wellness configuration)
CREATE TABLE IF NOT EXISTS wellness_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  weight DECIMAL(5,2), -- in kg
  height DECIMAL(5,2), -- in cm
  goals TEXT[], -- array of wellness goals
  activity_level INTEGER CHECK (activity_level BETWEEN 0 AND 3), -- 0=sedentary, 3=very active
  language TEXT CHECK (language IN ('sw', 'en')) DEFAULT 'sw',
  daily_calorie_target INTEGER DEFAULT 2000,
  profile_type TEXT DEFAULT 'adult', -- adult, child, elder
  relationship TEXT, -- for family members: child, parent, partner, elder
  is_primary BOOLEAN DEFAULT false, -- is this the user's own profile?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meals (nutrition tracking)
CREATE TABLE IF NOT EXISTS wellness_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES wellness_profiles(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  foods JSONB NOT NULL, -- [{name, portion, calories}]
  total_calories INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts/Activities
CREATE TABLE IF NOT EXISTS wellness_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES wellness_profiles(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  activity_type TEXT NOT NULL, -- walking, running, yoga, etc
  duration_minutes INTEGER NOT NULL,
  intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  calories_burned INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Habits (water, sleep, steps)
CREATE TABLE IF NOT EXISTS wellness_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES wellness_profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  water_glasses INTEGER DEFAULT 0,
  sleep_hours DECIMAL(3,1) DEFAULT 0,
  steps INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, date) -- one record per profile per day
);

-- ============================================================================
-- PATIENT QUEUE MANAGEMENT TABLES
-- ============================================================================

-- Patient Queue (hospital workflow)
CREATE TABLE IF NOT EXISTS patient_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL, -- e.g., P-0012
  patient_name TEXT NOT NULL,
  age INTEGER,
  sex TEXT CHECK (sex IN ('M', 'F', 'O')) NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'urgent', 'emergency')) DEFAULT 'low',
  complaint TEXT NOT NULL,
  department TEXT NOT NULL, -- OPD, Emergency, Maternity, Paediatrics
  status TEXT CHECK (status IN ('Waiting', 'In Consultation', 'Completed', 'Cancelled')) DEFAULT 'Waiting',
  arrival_time TIMESTAMPTZ DEFAULT NOW(),
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  -- Vitals
  blood_pressure TEXT,
  heart_rate INTEGER,
  temperature DECIMAL(3,1),
  oxygen_saturation INTEGER,
  -- Maternal care
  is_pregnant BOOLEAN DEFAULT false,
  weeks_gestation INTEGER,
  -- Metadata
  assigned_to UUID, -- clinician user_id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinical Notes (SOAP documentation)
CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES patient_queue(id) ON DELETE CASCADE NOT NULL,
  clinician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subjective TEXT, -- S: Patient's complaint in own words
  objective TEXT, -- O: Clinical findings, exam results
  assessment TEXT, -- A: Diagnosis, differential diagnoses
  plan TEXT, -- P: Treatment plan, investigations
  icd10_codes TEXT[], -- Array of ICD-10 codes
  signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Orders
CREATE TABLE IF NOT EXISTS lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES patient_queue(id) ON DELETE CASCADE NOT NULL,
  test_type TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('Routine', 'Urgent', 'STAT')) DEFAULT 'Routine',
  status TEXT CHECK (status IN ('Ordered', 'Processing', 'Completed', 'Cancelled')) DEFAULT 'Ordered',
  results JSONB, -- Lab results data
  ordered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication Dispensing
CREATE TABLE IF NOT EXISTS medication_dispense (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES patient_queue(id) ON DELETE CASCADE NOT NULL,
  drug_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  status TEXT CHECK (status IN ('Verify', 'Ready', 'Dispensed', 'Cancelled')) DEFAULT 'Verify',
  prescribed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dispensed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dispensed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Wellness indexes
CREATE INDEX IF NOT EXISTS idx_wellness_profiles_user_id ON wellness_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_meals_profile_date ON wellness_meals(profile_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_workouts_profile_date ON wellness_workouts(profile_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_habits_profile_date ON wellness_habits(profile_id, date DESC);

-- Patient queue indexes
CREATE INDEX IF NOT EXISTS idx_patient_queue_status ON patient_queue(status);
CREATE INDEX IF NOT EXISTS idx_patient_queue_department ON patient_queue(department);
CREATE INDEX IF NOT EXISTS idx_patient_queue_risk ON patient_queue(risk_level);
CREATE INDEX IF NOT EXISTS idx_patient_queue_facility ON patient_queue(facility_id);
CREATE INDEX IF NOT EXISTS idx_patient_queue_arrival ON patient_queue(arrival_time DESC);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_queue ON clinical_notes(queue_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_queue ON lab_orders(queue_id);
CREATE INDEX IF NOT EXISTS idx_medication_dispense_queue ON medication_dispense(queue_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE wellness_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_dispense ENABLE ROW LEVEL SECURITY;

-- Wellness Profiles: Users can manage their own profiles
CREATE POLICY wellness_profiles_select ON wellness_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY wellness_profiles_insert ON wellness_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY wellness_profiles_update ON wellness_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY wellness_profiles_delete ON wellness_profiles
  FOR DELETE USING (user_id = auth.uid());

-- Wellness Meals: Users can manage meals for their profiles
CREATE POLICY wellness_meals_select ON wellness_meals
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM wellness_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY wellness_meals_insert ON wellness_meals
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM wellness_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY wellness_meals_delete ON wellness_meals
  FOR DELETE USING (
    profile_id IN (
      SELECT id FROM wellness_profiles WHERE user_id = auth.uid()
    )
  );

-- Wellness Workouts: Users can manage workouts for their profiles
CREATE POLICY wellness_workouts_select ON wellness_workouts
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM wellness_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY wellness_workouts_insert ON wellness_workouts
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM wellness_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY wellness_workouts_delete ON wellness_workouts
  FOR DELETE USING (
    profile_id IN (
      SELECT id FROM wellness_profiles WHERE user_id = auth.uid()
    )
  );

-- Wellness Habits: Users can manage habits for their profiles
CREATE POLICY wellness_habits_select ON wellness_habits
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM wellness_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY wellness_habits_insert ON wellness_habits
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM wellness_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY wellness_habits_update ON wellness_habits
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM wellness_profiles WHERE user_id = auth.uid()
    )
  );

-- Patient Queue: Clinicians and CHWs can view patients
CREATE POLICY patient_queue_select ON patient_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinician', 'chw', 'admin')
    )
  );

CREATE POLICY patient_queue_insert ON patient_queue
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinician', 'chw', 'admin')
    )
  );

CREATE POLICY patient_queue_update ON patient_queue
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinician', 'chw', 'admin')
    )
  );

-- Clinical Notes: Only clinicians can create/view
CREATE POLICY clinical_notes_select ON clinical_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinician', 'admin')
    )
  );

CREATE POLICY clinical_notes_insert ON clinical_notes
  FOR INSERT WITH CHECK (
    clinician_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'clinician'
    )
  );

CREATE POLICY clinical_notes_update ON clinical_notes
  FOR UPDATE USING (
    clinician_id = auth.uid() AND NOT signed
  );

-- Lab Orders: Clinicians can create, lab staff can update
CREATE POLICY lab_orders_select ON lab_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinician', 'chw', 'admin')
    )
  );

CREATE POLICY lab_orders_insert ON lab_orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinician', 'admin')
    )
  );

CREATE POLICY lab_orders_update ON lab_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinician', 'admin')
    )
  );

-- Medication Dispense: Clinicians prescribe, pharmacy dispenses
CREATE POLICY medication_dispense_select ON medication_dispense
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinician', 'chw', 'admin')
    )
  );

CREATE POLICY medication_dispense_insert ON medication_dispense
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinician', 'admin')
    )
  );

CREATE POLICY medication_dispense_update ON medication_dispense
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinician', 'admin')
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER wellness_profiles_updated_at
  BEFORE UPDATE ON wellness_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER patient_queue_updated_at
  BEFORE UPDATE ON patient_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER clinical_notes_updated_at
  BEFORE UPDATE ON clinical_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Wellness summary per profile
CREATE OR REPLACE VIEW wellness_summary AS
SELECT 
  wp.id AS profile_id,
  wp.user_id,
  wp.name,
  COUNT(DISTINCT wm.id) AS total_meals,
  COUNT(DISTINCT ww.id) AS total_workouts,
  AVG(wh.water_glasses) AS avg_water,
  AVG(wh.sleep_hours) AS avg_sleep,
  AVG(wh.steps) AS avg_steps
FROM wellness_profiles wp
LEFT JOIN wellness_meals wm ON wp.id = wm.profile_id AND wm.date >= NOW() - INTERVAL '7 days'
LEFT JOIN wellness_workouts ww ON wp.id = ww.profile_id AND ww.date >= NOW() - INTERVAL '7 days'
LEFT JOIN wellness_habits wh ON wp.id = wh.profile_id AND wh.date >= NOW() - INTERVAL '7 days'
GROUP BY wp.id, wp.user_id, wp.name;

-- Patient queue summary by department
CREATE OR REPLACE VIEW queue_summary AS
SELECT 
  department,
  status,
  risk_level,
  COUNT(*) AS patient_count,
  AVG(EXTRACT(EPOCH FROM (NOW() - arrival_time))/60)::INTEGER AS avg_wait_minutes
FROM patient_queue
WHERE DATE(arrival_time) = CURRENT_DATE
GROUP BY department, status, risk_level;

COMMENT ON SCHEMA public IS 'AfyaCare Tanzania - Comprehensive Healthcare Platform';
