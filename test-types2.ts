import { SupabaseClient } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      test_table: {
        Row: { id: string, name: string };
        Insert: { name: string };
        Update: { name?: string };
        Relationships: [];
      }
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  }
}

const db = {} as SupabaseClient<Database>;
const res = db.from('test_table').insert({ name: 'test' });
