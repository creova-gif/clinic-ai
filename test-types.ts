import { createClient } from '@supabase/supabase-js';

interface DB { 
  public: { 
    Tables: { 
      test: { Row: { id: string }; Insert: { id?: string }; Update: { id?: string }; } 
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  } 
}
const client = createClient<DB>('http://a', 'a');
client.from('test').insert({ id: 'a' });
