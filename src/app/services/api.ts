/**
 * API Service Layer
 * 
 * ARCHITECTURE:
 * - Single source of truth for all API calls
 * - Automatic offline queue integration
 * - Error handling and retry logic
 * - Audit logging
 * - Type-safe operations
 * 
 * USAGE:
 * import { api } from '@/app/services/api';
 * const appointment = await api.appointments.create(data);
 */

import {
  supabase,
  USE_MOCK_DATA,
  type Appointment,
  type AppointmentInsert,
  type AppointmentUpdate,
  type Medication,
  type MedicationInsert,
  type MedicationUpdate,
  type TestResult,
  type TestResultInsert,
  type Facility,
  type SymptomAssessmentInsert,
  type MaternalCare,
  type MaternalCareInsert,
  type MaternalCareUpdate,
  type AuditLogInsert,
} from './supabase';
import { OfflineQueue } from './offlineQueue';
import { mockData } from './mockData';

// Generic API Response
interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

// Helper: Create API response
function createResponse<T = any>(data: any = null, error: Error | null = null): ApiResponse<T> {
  return {
    data,
    error,
    success: !error,
  };
}

// Helper: Log audit trail
async function logAudit(action: string, resourceType: string, resourceId?: string, metadata?: any) {
  const auditData: AuditLogInsert = {
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata: metadata || {},
    user_agent: navigator.userAgent,
  };

  if (USE_MOCK_DATA) {
    console.log('📝 Audit Log (Mock):', auditData);
    return;
  }

  try {
    await (supabase as any).from('audit_logs').insert(auditData);
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

// ============================================
// APPOINTMENTS SERVICE
// ============================================
const appointments = {
  /**
   * Get all appointments for current user
   */
  async list(userId: string): Promise<ApiResponse<Appointment[]>> {
    if (USE_MOCK_DATA) {
      return createResponse(mockData.appointments);
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },

  /**
   * Create new appointment
   */
  async create(appointment: AppointmentInsert): Promise<ApiResponse<Appointment>> {
    if (USE_MOCK_DATA) {
      const newAppointment: Appointment = {
        ...appointment,
        id: `apt_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.appointments.push(newAppointment);
      console.log('✅ Mock Appointment Created:', newAppointment);
      return createResponse(newAppointment);
    }

    try {
      // If offline, queue the operation
      if (!navigator.onLine) {
        await OfflineQueue.add('create', 'appointments', appointment);
        const mockAppointment: Appointment = {
          ...appointment,
          id: `pending_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return createResponse(mockAppointment);
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await logAudit('create_appointment', 'appointments', data.id, {
        facility_id: appointment.facility_id,
        date: appointment.date,
      });

      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },

  /**
   * Cancel appointment
   */
  async cancel(appointmentId: string): Promise<ApiResponse<Appointment>> {
    if (USE_MOCK_DATA) {
      const appointment = mockData.appointments.find((a) => a.id === appointmentId);
      if (appointment) {
        appointment.status = 'cancelled';
        console.log('✅ Mock Appointment Cancelled:', appointment);
        return createResponse(appointment);
      }
      return createResponse(null, new Error('Appointment not found'));
    }

    try {
      if (!navigator.onLine) {
        await OfflineQueue.add('update', 'appointments', { id: appointmentId, status: 'cancelled' });
        return createResponse(null);
      }

      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      await logAudit('cancel_appointment', 'appointments', appointmentId);

      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },

  /**
   * Reschedule appointment
   */
  async reschedule(
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<ApiResponse<Appointment>> {
    if (USE_MOCK_DATA) {
      const appointment = mockData.appointments.find((a) => a.id === appointmentId);
      if (appointment) {
        appointment.date = newDate;
        appointment.time = newTime;
        console.log('✅ Mock Appointment Rescheduled:', appointment);
        return createResponse(appointment);
      }
      return createResponse(null, new Error('Appointment not found'));
    }

    try {
      if (!navigator.onLine) {
        await OfflineQueue.add('update', 'appointments', {
          id: appointmentId,
          date: newDate,
          time: newTime,
        });
        return createResponse(null);
      }

      const { data, error } = await supabase
        .from('appointments')
        .update({ date: newDate, time: newTime })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      await logAudit('reschedule_appointment', 'appointments', appointmentId, {
        new_date: newDate,
        new_time: newTime,
      });

      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },
};

// ============================================
// MEDICATIONS SERVICE
// ============================================
const medications = {
  /**
   * Get all medications for user
   */
  async list(userId: string): Promise<ApiResponse<Medication[]>> {
    if (USE_MOCK_DATA) {
      return createResponse(mockData.medications);
    }

    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },

  /**
   * Add new medication
   */
  async create(medication: MedicationInsert): Promise<ApiResponse<Medication>> {
    if (USE_MOCK_DATA) {
      const newMedication: Medication = {
        ...medication,
        id: `med_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.medications.push(newMedication);
      console.log('✅ Mock Medication Created:', newMedication);
      return createResponse(newMedication);
    }

    try {
      if (!navigator.onLine) {
        await OfflineQueue.add('create', 'medications', medication);
        const mockMedication: Medication = {
          ...medication,
          id: `pending_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return createResponse(mockMedication);
      }

      const { data, error } = await supabase
        .from('medications')
        .insert(medication)
        .select()
        .single();

      if (error) throw error;

      await logAudit('create_medication', 'medications', data.id, {
        name: medication.name,
      });

      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },

  /**
   * Update medication
   */
  async update(id: string, updates: MedicationUpdate): Promise<ApiResponse<Medication>> {
    if (USE_MOCK_DATA) {
      const medication = mockData.medications.find((m) => m.id === id);
      if (medication) {
        Object.assign(medication, updates);
        console.log('✅ Mock Medication Updated:', medication);
        return createResponse(medication);
      }
      return createResponse(null, new Error('Medication not found'));
    }

    try {
      if (!navigator.onLine) {
        await OfflineQueue.add('update', 'medications', { id, ...updates });
        return createResponse(null);
      }

      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logAudit('update_medication', 'medications', id, updates);

      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },

  /**
   * Delete medication
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCK_DATA) {
      const index = mockData.medications.findIndex((m) => m.id === id);
      if (index !== -1) {
        mockData.medications.splice(index, 1);
        console.log('✅ Mock Medication Deleted:', id);
        return createResponse(null);
      }
      return createResponse(null, new Error('Medication not found'));
    }

    try {
      if (!navigator.onLine) {
        await OfflineQueue.add('update', 'medications', { id, active: false });
        return createResponse(null);
      }

      const { error } = await (supabase as any).from('medications').update({ active: false }).eq('id', id);

      if (error) throw error;

      await logAudit('delete_medication', 'medications', id);

      return createResponse(null);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },
};

// ============================================
// FACILITIES SERVICE
// ============================================
const facilities = {
  /**
   * Get all facilities
   */
  async list(): Promise<ApiResponse<Facility[]>> {
    if (USE_MOCK_DATA) {
      return createResponse(mockData.facilities);
    }

    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },

  /**
   * Search facilities by location
   */
  async searchNearby(latitude: number, longitude: number, radiusKm: number = 50): Promise<ApiResponse<Facility[]>> {
    if (USE_MOCK_DATA) {
      return createResponse(mockData.facilities);
    }

    try {
      // In production, use PostGIS for geospatial queries
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      // Simple distance calculation (in production, use PostGIS)
      const facilitiesWithDistance = data?.map((facility) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          facility.latitude!,
          facility.longitude!
        );
        return { ...facility, distance: `${distance.toFixed(1)} km` };
      }).filter((f) => parseFloat(f.distance) <= radiusKm);

      return createResponse(facilitiesWithDistance || []);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },
};

// ============================================
// TEST RESULTS SERVICE
// ============================================
const testResults = {
  /**
   * Get test results for user
   */
  async list(userId: string): Promise<ApiResponse<TestResult[]>> {
    if (USE_MOCK_DATA) {
      return createResponse(mockData.testResults);
    }

    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('test_date', { ascending: false });

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },

  /**
   * Get single test result
   */
  async get(id: string): Promise<ApiResponse<TestResult>> {
    if (USE_MOCK_DATA) {
      const result = mockData.testResults.find((r) => r.id === id);
      return result ? createResponse(result) : createResponse(null, new Error('Not found'));
    }

    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },
};

// ============================================
// SYMPTOM ASSESSMENTS SERVICE
// ============================================
const symptomAssessments = {
  /**
   * Save symptom assessment
   */
  async create(assessment: SymptomAssessmentInsert): Promise<ApiResponse<void>> {
    if (USE_MOCK_DATA) {
      console.log('✅ Mock Symptom Assessment Saved:', assessment);
      return createResponse(null);
    }

    try {
      if (!navigator.onLine) {
        await OfflineQueue.add('create', 'symptom_assessments', assessment);
        return createResponse(null);
      }

      const { error } = await (supabase as any).from('symptom_assessments').insert(assessment);

      if (error) throw error;

      await logAudit('symptom_assessment', 'symptom_assessments', assessment.session_id, {
        language: assessment.language,
        triage_level: assessment.triage_result?.level,
      });

      return createResponse(null);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },
};

// ============================================
// MATERNAL CARE SERVICE
// ============================================
const maternalCare = {
  /**
   * Get maternal care record
   */
  async get(userId: string): Promise<ApiResponse<MaternalCare | null>> {
    if (USE_MOCK_DATA) {
      return createResponse(mockData.maternalCare);
    }

    try {
      const { data, error } = await supabase
        .from('maternal_care')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return createResponse(data || null);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },

  /**
   * Create maternal care record
   */
  async create(record: MaternalCareInsert): Promise<ApiResponse<MaternalCare>> {
    if (USE_MOCK_DATA) {
      const newRecord: MaternalCare = {
        ...record,
        id: `mat_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.maternalCare = newRecord;
      console.log('✅ Mock Maternal Care Created:', newRecord);
      return createResponse(newRecord);
    }

    try {
      if (!navigator.onLine) {
        await OfflineQueue.add('create', 'maternal_care', record);
        const mockRecord: MaternalCare = {
          ...record,
          id: `pending_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return createResponse(mockRecord);
      }

      const { data, error } = await supabase
        .from('maternal_care')
        .insert(record)
        .select()
        .single();

      if (error) throw error;

      await logAudit('create_maternal_care', 'maternal_care', data.id);

      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },

  /**
   * Update maternal care record
   */
  async update(id: string, updates: MaternalCareUpdate): Promise<ApiResponse<MaternalCare>> {
    if (USE_MOCK_DATA) {
      if (mockData.maternalCare) {
        Object.assign(mockData.maternalCare, updates);
        console.log('✅ Mock Maternal Care Updated:', mockData.maternalCare);
        return createResponse(mockData.maternalCare);
      }
      return createResponse(null, new Error('Maternal care record not found'));
    }

    try {
      if (!navigator.onLine) {
        await OfflineQueue.add('update', 'maternal_care', { id, ...updates });
        return createResponse(null as any);
      }

      const { data, error } = await supabase
        .from('maternal_care')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logAudit('update_maternal_care', 'maternal_care', id, updates);

      return createResponse(data);
    } catch (error) {
      return createResponse(null, error as Error);
    }
  },
};

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Export unified API
export const api = {
  appointments,
  medications,
  facilities,
  testResults,
  symptomAssessments,
  maternalCare,
};

export type { ApiResponse };
