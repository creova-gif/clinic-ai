/**
 * Patient Queue API Service
 * 
 * Hospital workflow management for clinicians and CHWs:
 * - Patient queue tracking
 * - Clinical documentation (SOAP notes)
 * - Lab orders
 * - Medication dispensing
 * 
 * FEATURES:
 * - Real-time queue status
 * - Triage and risk assessment
 * - Audit logging
 * - Role-based access
 */

import { supabase, USE_MOCK_DATA } from './supabase';
import type { RiskLevel } from './clinicalProductHold';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PatientQueueItem {
  id: string;
  patient_id: string; // e.g., P-0012
  patient_name: string;
  age: number;
  sex: 'M' | 'F' | 'O';
  risk_level: RiskLevel;
  complaint: string;
  department: string;
  status: 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  arrival_time: string;
  facility_id?: string;
  // Vitals
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  oxygen_saturation?: number;
  // Maternal
  is_pregnant: boolean;
  weeks_gestation?: number;
  // Metadata
  assigned_to?: string; // clinician user_id
  created_at: string;
  updated_at: string;
}

export interface ClinicalNote {
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

export interface LabOrder {
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

export interface MedicationDispense {
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

// ============================================================================
// PATIENT QUEUE API
// ============================================================================

export const patientQueueApi = {
  // ============================================================================
  // QUEUE MANAGEMENT
  // ============================================================================

  // Get all patients in queue
  async getQueue(filters?: {
    department?: string;
    status?: string;
    risk_level?: string;
    facility_id?: string;
  }): Promise<PatientQueueItem[]> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: Patient queue loaded');
      return getMockQueue();
    }

    let query = supabase
      .from('patient_queue')
      .select('*')
      .order('risk_level', { ascending: false }) // High risk first
      .order('arrival_time', { ascending: true }); // Then FIFO

    if (filters?.department) {
      query = query.eq('department', filters.department);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.risk_level) {
      query = query.eq('risk_level', filters.risk_level);
    }
    if (filters?.facility_id) {
      query = query.eq('facility_id', filters.facility_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get single patient
  async getPatient(id: string): Promise<PatientQueueItem | null> {
    if (USE_MOCK_DATA) {
      const queue = getMockQueue();
      return queue.find(p => p.id === id) || null;
    }

    const { data, error } = await supabase
      .from('patient_queue')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Add patient to queue
  async addPatient(patient: Omit<PatientQueueItem, 'id' | 'created_at' | 'updated_at'>): Promise<PatientQueueItem> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: Added patient to queue', patient);
      return {
        ...patient,
        id: 'mock-queue-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('patient_queue')
      .insert(patient)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update patient status
  async updatePatient(id: string, updates: Partial<PatientQueueItem>): Promise<PatientQueueItem> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: Updated patient', id, updates);
      return { id, ...updates } as PatientQueueItem;
    }

    const { data, error } = await supabase
      .from('patient_queue')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete patient from queue
  async removePatient(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: Removed patient', id);
      return;
    }

    const { error } = await supabase
      .from('patient_queue')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get queue statistics
  async getQueueStats(facility_id?: string): Promise<{
    total: number;
    waiting: number;
    inConsultation: number;
    highRisk: number;
    urgent: number;
    emergency: number;
    avgWaitMinutes: number;
  }> {
    if (USE_MOCK_DATA) {
      return {
        total: 12,
        waiting: 8,
        inConsultation: 3,
        highRisk: 0,
        urgent: 1,
        emergency: 1,
        avgWaitMinutes: 28,
      };
    }

    let query = supabase
      .from('patient_queue')
      .select('*');

    if (facility_id) {
      query = query.eq('facility_id', facility_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    const now = new Date();
    const waiting = data?.filter(p => p.status === 'Waiting') || [];
    
    return {
      total: data?.length || 0,
      waiting: waiting.length,
      inConsultation: data?.filter(p => p.status === 'In Consultation').length || 0,
      highRisk: data?.filter(p => p.risk_level === 'high').length || 0,
      urgent: data?.filter(p => p.risk_level === 'urgent').length || 0,
      emergency: data?.filter(p => p.risk_level === 'emergency').length || 0,
      avgWaitMinutes: waiting.length > 0
        ? Math.round(
            waiting.reduce((sum, p) => {
              const wait = (now.getTime() - new Date(p.arrival_time).getTime()) / 1000 / 60;
              return sum + wait;
            }, 0) / waiting.length
          )
        : 0,
    };
  },

  // ============================================================================
  // CLINICAL NOTES
  // ============================================================================

  // Get clinical note for patient
  async getClinicalNote(queueId: string): Promise<ClinicalNote | null> {
    if (USE_MOCK_DATA) {
      return null;
    }

    const { data, error } = await supabase
      .from('clinical_notes')
      .select('*')
      .eq('queue_id', queueId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
    return data;
  },

  // Create/Update clinical note
  async saveClinicalNote(note: Omit<ClinicalNote, 'id' | 'created_at' | 'updated_at'>): Promise<ClinicalNote> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: Saved clinical note', note);
      return {
        ...note,
        id: 'mock-note-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('clinical_notes')
      .insert(note)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Sign clinical note
  async signNote(id: string): Promise<ClinicalNote> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: Signed note', id);
      return {
        id,
        signed: true,
        signed_at: new Date().toISOString(),
      } as ClinicalNote;
    }

    const { data, error } = await supabase
      .from('clinical_notes')
      .update({
        signed: true,
        signed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================================
  // LAB ORDERS
  // ============================================================================

  // Get lab orders for patient
  async getLabOrders(queueId: string): Promise<LabOrder[]> {
    if (USE_MOCK_DATA) {
      return getMockLabOrders(queueId);
    }

    const { data, error } = await supabase
      .from('lab_orders')
      .select('*')
      .eq('queue_id', queueId)
      .order('ordered_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create lab order
  async createLabOrder(order: Omit<LabOrder, 'id' | 'created_at'>): Promise<LabOrder> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: Created lab order', order);
      return {
        ...order,
        id: 'mock-lab-' + Date.now(),
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('lab_orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update lab order status
  async updateLabOrder(id: string, updates: Partial<LabOrder>): Promise<LabOrder> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: Updated lab order', id, updates);
      return { id, ...updates } as LabOrder;
    }

    const { data, error } = await supabase
      .from('lab_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================================
  // MEDICATION DISPENSING
  // ============================================================================

  // Get medication orders for patient
  async getMedications(queueId: string): Promise<MedicationDispense[]> {
    if (USE_MOCK_DATA) {
      return getMockMedications(queueId);
    }

    const { data, error } = await supabase
      .from('medication_dispense')
      .select('*')
      .eq('queue_id', queueId)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  },

  // Create medication order
  async createMedication(med: Omit<MedicationDispense, 'id' | 'created_at'>): Promise<MedicationDispense> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: Created medication order', med);
      return {
        ...med,
        id: 'mock-med-' + Date.now(),
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('medication_dispense')
      .insert(med)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update medication status
  async updateMedication(id: string, updates: Partial<MedicationDispense>): Promise<MedicationDispense> {
    if (USE_MOCK_DATA) {
      console.log('🎭 MOCK: Updated medication', id, updates);
      return { id, ...updates } as MedicationDispense;
    }

    const { data, error } = await supabase
      .from('medication_dispense')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// MOCK DATA
// ============================================================================

function getMockQueue(): PatientQueueItem[] {
  return [
    {
      id: 'mock-q-1',
      patient_id: 'P-0012',
      patient_name: 'Amina Juma',
      age: 28,
      sex: 'F',
      risk_level: 'emergency',
      complaint: 'Severe headache, blurred vision',
      department: 'OPD',
      status: 'Waiting',
      arrival_time: new Date(Date.now() - 45 * 60000).toISOString(),
      blood_pressure: '165/110',
      heart_rate: 98,
      temperature: 37.2,
      oxygen_saturation: 98,
      is_pregnant: true,
      weeks_gestation: 32,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'mock-q-2',
      patient_id: 'P-0013',
      patient_name: 'Joseph Mwangi',
      age: 52,
      sex: 'M',
      risk_level: 'urgent',
      complaint: 'Chest tightness, shortness of breath',
      department: 'Emergency',
      status: 'In Consultation',
      arrival_time: new Date(Date.now() - 28 * 60000).toISOString(),
      blood_pressure: '148/92',
      heart_rate: 88,
      temperature: 36.8,
      oxygen_saturation: 96,
      is_pregnant: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'mock-q-3',
      patient_id: 'P-0014',
      patient_name: 'Fatuma Said',
      age: 7,
      sex: 'F',
      risk_level: 'medium',
      complaint: 'Fever 3 days, vomiting',
      department: 'Paediatrics',
      status: 'Waiting',
      arrival_time: new Date(Date.now() - 15 * 60000).toISOString(),
      heart_rate: 112,
      temperature: 38.9,
      oxygen_saturation: 99,
      is_pregnant: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

function getMockLabOrders(queueId: string): LabOrder[] {
  return [
    {
      id: 'mock-lab-1',
      queue_id: queueId,
      test_type: 'Full blood count + urine protein',
      priority: 'Urgent',
      status: 'Processing',
      ordered_by: 'dr-kamau',
      ordered_at: new Date(Date.now() - 25 * 60000).toISOString(),
      created_at: new Date().toISOString(),
    },
  ];
}

function getMockMedications(queueId: string): MedicationDispense[] {
  return [
    {
      id: 'mock-med-1',
      queue_id: queueId,
      drug_name: 'Paracetamol 500mg',
      dosage: '1 tablet q6h',
      status: 'Verify',
      prescribed_by: 'dr-kamau',
      created_at: new Date().toISOString(),
    },
  ];
}