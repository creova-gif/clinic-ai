/**
 * Supabase Client Configuration
 * 
 * PRODUCTION SETUP:
 * 1. Replace SUPABASE_URL and SUPABASE_ANON_KEY with real values
 * 2. Enable RLS policies in Supabase dashboard
 * 3. Set up database tables (see schema.sql)
 * 
 * SECURITY:
 * - Uses anon key (safe for client-side)
 * - RLS policies enforce data access control
 * - No secrets exposed
 */

import { createClient } from '@supabase/supabase-js';

// DEPLOYMENT: Set these in .env.local (see .env.example)
// Vite exposes env vars via import.meta.env.VITE_*, NOT process.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Singleton instance to prevent multiple clients
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'afyacare-auth', // Unique key to avoid conflicts
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'afyacare-tanzania',
      },
    },
  });

  return supabaseInstance;
}

export const supabase = getSupabaseClient();

// Database Types
export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      medications: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      test_results: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      facilities: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      symptom_assessments: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      maternal_care: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      offline_queue: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      audit_logs: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      wellness_profiles: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      wellness_meals: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      wellness_workouts: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      wellness_habits: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      patient_queue: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      clinical_notes: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      lab_orders: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      medication_dispense: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      drug_inventory: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      stock_movements: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      purchase_orders: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      prescriptions: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      chw_profiles: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      chw_dispatch_tasks: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      ai_telemetry: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      triage_outcomes_feedback: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Type Definitions
export type Appointment = {
  id: string;
  user_id: string;
  facility_id: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  notes?: string;
  has_insurance: boolean;
  created_at: string;
  updated_at: string;
}

export type AppointmentInsert = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
export type AppointmentUpdate = Partial<AppointmentInsert>;

export type Medication = {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  reminder_times: string[];
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type MedicationInsert = Omit<Medication, 'id' | 'created_at' | 'updated_at'>;
export type MedicationUpdate = Partial<MedicationInsert>;

export type TestResult = {
  id: string;
  user_id: string;
  facility_id: string;
  test_type: string;
  test_date: string;
  results: any; // JSON field
  status: 'pending' | 'completed' | 'reviewed';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export type TestResultInsert = Omit<TestResult, 'id' | 'created_at' | 'updated_at'>;
export type TestResultUpdate = Partial<TestResultInsert>;

export type Facility = {
  id: string;
  name: string;
  name_sw: string;
  type: 'hospital' | 'health_center' | 'dispensary' | 'clinic';
  address: string;
  address_sw: string;
  region: string;
  district: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  services: string[];
  operating_hours?: any; // JSON field
  current_load?: 'low' | 'medium' | 'high';
  wait_time_minutes?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type FacilityInsert = Omit<Facility, 'id' | 'created_at' | 'updated_at'>;
export type FacilityUpdate = Partial<FacilityInsert>;

export type SymptomAssessment = {
  id: string;
  user_id?: string;
  session_id: string;
  symptoms: any; // JSON field - array of answered questions
  triage_result: any; // JSON field - ClinicalTriageEngine output
  language: 'sw' | 'en';
  created_at: string;
}

export type SymptomAssessmentInsert = Omit<SymptomAssessment, 'id' | 'created_at'>;
export type SymptomAssessmentUpdate = Partial<SymptomAssessmentInsert>;

export type MaternalCare = {
  id: string;
  user_id: string;
  pregnancy_start_date: string;
  estimated_due_date: string;
  current_week: number;
  risk_level: 'low' | 'medium' | 'high';
  vital_signs: any[]; // JSON array
  checkups: any[]; // JSON array
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type MaternalCareInsert = Omit<MaternalCare, 'id' | 'created_at' | 'updated_at'>;
export type MaternalCareUpdate = Partial<MaternalCareInsert>;

export type OfflineQueueItem = {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: any; // JSON field
  status: 'pending' | 'synced' | 'failed';
  retry_count: number;
  error_message?: string;
  created_at: string;
  synced_at?: string;
}

export type OfflineQueueInsert = Omit<OfflineQueueItem, 'id' | 'created_at' | 'synced_at'>;
export type OfflineQueueUpdate = Partial<OfflineQueueInsert>;

export type AuditLog = {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata: any; // JSON field
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'>;
export type AuditLogUpdate = Partial<AuditLogInsert>;

export type WellnessProfile = {
  id: string;
  user_id: string;
  name: string;
  age: number;
  weight?: number; // kg
  height?: number; // cm
  goals: string[];
  activity_level: number; // 0-3
  language: 'sw' | 'en';
  daily_calorie_target: number;
  profile_type: 'adult' | 'child' | 'elder';
  relationship?: string; // child, parent, partner, elder
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export type WellnessProfileInsert = Omit<WellnessProfile, 'id' | 'created_at' | 'updated_at'>;
export type WellnessProfileUpdate = Partial<WellnessProfileInsert>;

export type WellnessMeal = {
  id: string;
  profile_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    name: string;
    portion: string;
    calories: number;
  }>;
  total_calories: number;
  notes?: string;
  created_at: string;
}

export type WellnessMealInsert = Omit<WellnessMeal, 'id' | 'created_at' | 'updated_at'>;
export type WellnessMealUpdate = Partial<WellnessMealInsert>;

export type WellnessWorkout = {
  id: string;
  profile_id: string;
  date: string;
  activity_type: string;
  duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  calories_burned?: number;
  notes?: string;
  created_at: string;
}

export type WellnessWorkoutInsert = Omit<WellnessWorkout, 'id' | 'created_at' | 'updated_at'>;
export type WellnessWorkoutUpdate = Partial<WellnessWorkoutInsert>;

export type WellnessHabit = {
  id: string;
  profile_id: string;
  date: string; // YYYY-MM-DD
  water_glasses: number;
  sleep_hours: number;
  steps: number;
  created_at: string;
}

export type WellnessHabitInsert = Omit<WellnessHabit, 'id' | 'created_at' | 'updated_at'>;
export type WellnessHabitUpdate = Partial<WellnessHabitInsert>;

export type PatientQueue = {
  id: string;
  user_id: string;
  facility_id: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  notes?: string;
  has_insurance: boolean;
  created_at: string;
  updated_at: string;
}

export type PatientQueueInsert = Omit<PatientQueue, 'id' | 'created_at' | 'updated_at'>;
export type PatientQueueUpdate = Partial<PatientQueueInsert>;

export type ClinicalNote = {
  id: string;
  queue_id: string;
  clinician_id: string;
  subjective: string; // S
  objective: string; // O
  assessment: string; // A
  plan: string; // P
  icd10_codes: string[];
  signed: boolean;
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

export type ClinicalNoteInsert = Omit<ClinicalNote, 'id' | 'created_at' | 'updated_at'>;
export type ClinicalNoteUpdate = Partial<ClinicalNoteInsert>;

export type LabOrder = {
  id: string;
  queue_id: string;
  test_type: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  status: 'Ordered' | 'Processing' | 'Completed' | 'Cancelled';
  results?: any;
  ordered_by: string;
  ordered_at: string;
  completed_at?: string;
  created_at: string;
}

export type LabOrderInsert = Omit<LabOrder, 'id' | 'created_at' | 'updated_at'>;
export type LabOrderUpdate = Partial<LabOrderInsert>;

export type MedicationDispense = {
  id: string;
  queue_id: string;
  drug_name: string;
  dosage: string;
  status: 'Verify' | 'Ready' | 'Dispensed' | 'Cancelled';
  prescribed_by: string;
  dispensed_by?: string;
  dispensed_at?: string;
  created_at: string;
}

export type MedicationDispenseInsert = Omit<MedicationDispense, 'id' | 'created_at' | 'updated_at'>;
export type MedicationDispenseUpdate = Partial<MedicationDispenseInsert>;

// Helper function to check if Supabase is configured

export type DrugInventory = {
  id: string;
  drug_name: string;
  generic_name: string;
  brand_name?: string;
  category: string; // Antibiotics, Analgesics, Antimalarials, etc.
  dosage_form: string; // Tablet, Syrup, Injection, etc.
  strength: string; // e.g., "500mg", "250mg/5ml"
  quantity: number;
  unit: string; // tablets, bottles, vials, etc.
  reorder_level: number; // Alert when below this
  batch_number: string;
  expiry_date: string;
  cost_per_unit: number;
  selling_price: number;
  supplier: string;
  location: string; // Shelf/bin location
  created_at: string;
  updated_at: string;
}

// Mock mode check — true when no env vars are set
export function isSupabaseConfigured() { return !!import.meta.env.VITE_SUPABASE_URL; }
export const USE_MOCK_DATA = !isSupabaseConfigured();

if (USE_MOCK_DATA) {
  // Only log in development to avoid noisy production logs
  if (import.meta.env.DEV) {
    console.info(
      '%c🎭 AfyaCare Development Mode',
      'background: #FEF3C7; color: #92400E; padding: 8px 12px; border-radius: 4px; font-weight: bold;',
      '\n\n✅ Running with mock data (safe for development)\n' +
      '📊 All features work with realistic test data\n' +
      '🔌 To enable production mode, copy .env.example → .env.local and fill in:\n' +
      '   VITE_SUPABASE_URL=your-project-url\n' +
      '   VITE_SUPABASE_ANON_KEY=your-anon-key\n'
    );
  }
}