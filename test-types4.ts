import { supabase } from './src/app/services/supabase';
import { MedicationInsert } from './src/app/services/supabase';

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
  const { data, error } = await supabase
    .from('medications')
    .insert(insertData)
    .select()
    .single();
    
  console.log(data?.id);
}
