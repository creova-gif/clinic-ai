import { SupabaseClient } from '@supabase/supabase-js';

export type Medication = {
  id: string;
};

export interface Database {
  public: {
    Tables: {
      medications: {
        Row: Medication;
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

const db = {} as SupabaseClient<Database>;
const insertData = {
  random_prop: 'hello'
};

async function test() {
  const { data, error } = await db
    .from('medications')
    .insert(insertData)
    .select()
    .single();
    
  console.log(data?.id);
}
