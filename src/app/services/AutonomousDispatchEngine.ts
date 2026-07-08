import { supabase } from './supabase';
import { getDispatchModel } from './firebaseAI';

export interface DispatchTask {
  id: string;
  chw_id: string;
  patient_name: string;
  patient_phone: string;
  patient_location: any;
  triage_level: string;
  reasoning: string;
  status: 'pending' | 'en_route' | 'completed' | 'cancelled';
  created_at: string;
}

export class AutonomousDispatchEngine {
  /**
   * Evaluates an urgent triage and autonomously assigns a CHW based on real-time location/language constraints.
   */
  static async dispatchCHW(
    patientInfo: { name: string; phone: string; location: any; language: string },
    triageResult: any
  ): Promise<DispatchTask | null> {
    try {
      // 1. Fetch available CHWs
      const { data: chws, error } = await supabase
        .from('chw_profiles')
        .select('*')
        .eq('active', true);

      if (error || !chws || chws.length === 0) {
        console.error('No active CHWs available for dispatch.', error);
        return null;
      }

      // 2. Ask AI to determine the best match
      const prompt = `
        You are an autonomous medical dispatcher for AfyaCare.
        An URGENT triage has occurred. Assign the best Community Health Worker (CHW).
        
        Patient Info:
        - Location: ${JSON.stringify(patientInfo.location)}
        - Language Preference: ${patientInfo.language}
        - Triage Reasoning: ${JSON.stringify(triageResult.reasoning)}

        Available CHWs:
        ${JSON.stringify(chws.map(chw => ({
          id: chw.id,
          name: chw.name,
          languages: chw.languages,
          location: chw.current_location
        })), null, 2)}
        
        Rules:
        1. Prioritize language match.
        2. Prioritize geographic proximity.
        
        Return exactly a JSON object matching the requested schema.
      `;

      const dispatchModel = getDispatchModel();
      const response = await dispatchModel.generateContent(prompt);
      const text = response.response.text();
      const aiDecision = JSON.parse(text);

      if (!aiDecision.chw_id) {
        throw new Error('AI failed to assign a CHW ID');
      }

      // 3. Insert the dispatch task into the database
      const { data: task, error: insertError } = await supabase
        .from('chw_dispatch_tasks')
        .insert({
          chw_id: aiDecision.chw_id,
          patient_name: patientInfo.name,
          patient_phone: patientInfo.phone,
          patient_location: patientInfo.location,
          triage_level: triageResult.level,
          reasoning: aiDecision.reasoning,
          status: 'pending'
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Failed to create dispatch task', insertError);
        return null;
      }

      return task;

    } catch (e) {
      console.error('Error during autonomous dispatch:', e);
      return null;
    }
  }

  /**
   * Fetch live dispatch tasks for a specific CHW
   */
  static async getTasksForCHW(chwId: string): Promise<DispatchTask[]> {
    const { data, error } = await supabase
      .from('chw_dispatch_tasks')
      .select('*')
      .eq('chw_id', chwId)
      .neq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch tasks', error);
      return [];
    }

    return data || [];
  }
}
