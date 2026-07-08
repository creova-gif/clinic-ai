import { SupabaseClient } from '@supabase/supabase-js';

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

export interface Database {
  public: {
    Tables: {
      medications: {
        Row: Medication;
        Insert: MedicationInsert;
        Update: MedicationUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

const db = {} as SupabaseClient<Database>;
const insertData: MedicationInsert = {
  user_id: '123',
  name: 'Aspirin',
  dosage: '100mg',
  frequency: 'daily',
  start_date: '2023-01-01',
  reminder_times: ['08:00'],
  active: true
};

async function test() {
  const { data, error } = await db
    .from('medications')
    .insert(insertData)
    .select()
    .single();
    
  console.log(data?.id);
}
