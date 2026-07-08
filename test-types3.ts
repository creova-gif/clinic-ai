import { supabase } from './src/app/services/supabase';
import { MedicationInsert } from './src/app/services/supabase';

const insertData: MedicationInsert = {
  name: 'Aspirin',
  description: 'Pain relief',
  dosage: '100mg',
  stock: 10,
  unit_price: 5
};

async function test() {
  const { data, error } = await supabase
    .from('medications')
    .insert(insertData)
    .select()
    .single();
    
  console.log(data?.id);
}
