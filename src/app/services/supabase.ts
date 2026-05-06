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
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: Appointment;
        Insert: AppointmentInsert;
        Update: AppointmentUpdate;
      };
      medications: {
        Row: Medication;
        Insert: MedicationInsert;
        Update: MedicationUpdate;
      };
      test_results: {
        Row: TestResult;
        Insert: TestResultInsert;
        Update: TestResultUpdate;
      };
      facilities: {
        Row: Facility;
        Insert: FacilityInsert;
        Update: FacilityUpdate;
      };
      symptom_assessments: {
        Row: SymptomAssessment;
        Insert: SymptomAssessmentInsert;
        Update: SymptomAssessmentUpdate;
      };
      maternal_care: {
        Row: MaternalCare;
        Insert: MaternalCareInsert;
        Update: MaternalCareUpdate;
      };
      offline_queue: {
        Row: OfflineQueueItem;
        Insert: OfflineQueueInsert;
        Update: OfflineQueueUpdate;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: AuditLogUpdate;
      };
      wellness_profiles: {
        Row: WellnessProfile;
        Insert: WellnessProfileInsert;
        Update: WellnessProfileUpdate;
      };
      wellness_meals: {
        Row: WellnessMeal;
        Insert: WellnessMealInsert;
        Update: WellnessMealUpdate;
      };
      wellness_workouts: {
        Row: WellnessWorkout;
        Insert: WellnessWorkoutInsert;
        Update: WellnessWorkoutUpdate;
      };
      wellness_habits: {
        Row: WellnessHabit;
        Insert: WellnessHabitInsert;
        Update: WellnessHabitUpdate;
      };
      patient_queue: {
        Row: PatientQueue;
        Insert: PatientQueueInsert;
        Update: PatientQueueUpdate;
      };
      clinical_notes: {
        Row: ClinicalNote;
        Insert: ClinicalNoteInsert;
        Update: ClinicalNoteUpdate;
      };
      lab_orders: {
        Row: LabOrder;
        Insert: LabOrderInsert;
        Update: LabOrderUpdate;
      };
      medication_dispense: {
        Row: MedicationDispense;
        Insert: MedicationDispenseInsert;
        Update: MedicationDispenseUpdate;
      };
    };
  };
}

// Type Definitions
export interface Appointment {
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

export interface Medication {
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

export interface TestResult {
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

export interface Facility {
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

export interface SymptomAssessment {
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

export interface MaternalCare {
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

export interface OfflineQueueItem {
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

export interface AuditLog {
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

export interface WellnessProfile {
  id: string;
  user_id: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  blood_type: string;
  allergies: string[];
  medical_conditions: string[];
  medications: string[];
  created_at: string;
  updated_at: string;
}

export type WellnessProfileInsert = Omit<WellnessProfile, 'id' | 'created_at' | 'updated_at'>;
export type WellnessProfileUpdate = Partial<WellnessProfileInsert>;

export interface WellnessMeal {
  id: string;
  user_id: string;
  meal_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  instructions: string;
  calories: number;
  created_at: string;
  updated_at: string;
}

export type WellnessMealInsert = Omit<WellnessMeal, 'id' | 'created_at' | 'updated_at'>;
export type WellnessMealUpdate = Partial<WellnessMealInsert>;

export interface WellnessWorkout {
  id: string;
  user_id: string;
  workout_name: string;
  workout_type: 'cardio' | 'strength' | 'flexibility';
  duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  description: string;
  created_at: string;
  updated_at: string;
}

export type WellnessWorkoutInsert = Omit<WellnessWorkout, 'id' | 'created_at' | 'updated_at'>;
export type WellnessWorkoutUpdate = Partial<WellnessWorkoutInsert>;

export interface WellnessHabit {
  id: string;
  user_id: string;
  habit_name: string;
  habit_type: 'daily' | 'weekly' | 'monthly';
  frequency: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export type WellnessHabitInsert = Omit<WellnessHabit, 'id' | 'created_at' | 'updated_at'>;
export type WellnessHabitUpdate = Partial<WellnessHabitInsert>;

export interface PatientQueue {
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

export interface ClinicalNote {
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

export type ClinicalNoteInsert = Omit<ClinicalNote, 'id' | 'created_at' | 'updated_at'>;
export type ClinicalNoteUpdate = Partial<ClinicalNoteInsert>;

export interface LabOrder {
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

export type LabOrderInsert = Omit<LabOrder, 'id' | 'created_at' | 'updated_at'>;
export type LabOrderUpdate = Partial<LabOrderInsert>;

export interface MedicationDispense {
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

export type MedicationDispenseInsert = Omit<MedicationDispense, 'id' | 'created_at' | 'updated_at'>;
export type MedicationDispenseUpdate = Partial<MedicationDispenseInsert>;

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// Mock mode check — true when no env vars are set
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