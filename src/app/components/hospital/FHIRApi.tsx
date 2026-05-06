/**
 * FHIR R4 API LAYER
 * 
 * National interoperability standard implementation
 * 
 * Features:
 * - FHIR R4 compliant resources
 * - OAuth 2.0 authentication
 * - Facility-scoped access
 * - RESTful endpoints
 * - HL7 FHIR search parameters
 * - Bundle support
 * - SMART on FHIR ready
 */

import type {
  Patient,
  Encounter,
  VitalSigns,
  LabOrder,
  LabResult,
  Prescription,
  ClinicalNote
} from '../../types/HospitalDataModel';

/**
 * FHIR R4 Resource Types
 */
export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier: Array<{
    system: string;
    value: string;
    type?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
  }>;
  active: boolean;
  name: Array<{
    use: 'official' | 'usual' | 'nickname';
    family: string;
    given: string[];
  }>;
  telecom?: Array<{
    system: 'phone' | 'email' | 'sms';
    value: string;
    use: 'home' | 'work' | 'mobile';
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  address?: Array<{
    use: 'home' | 'work';
    type: 'physical' | 'postal';
    text?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
  }>;
  managingOrganization?: {
    reference: string;
    display: string;
  };
}

export interface FHIREncounter {
  resourceType: 'Encounter';
  id: string;
  status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';
  class: {
    system: string;
    code: string;
    display: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  participant?: Array<{
    type?: Array<{
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    }>;
    individual?: {
      reference: string;
      display: string;
    };
  }>;
  period?: {
    start: string;
    end?: string;
  };
  serviceProvider?: {
    reference: string;
    display: string;
  };
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'cancelled';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  encounter?: {
    reference: string;
  };
  effectiveDateTime: string;
  issued?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
  valueCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  referenceRange?: Array<{
    low?: { value: number; unit: string };
    high?: { value: number; unit: string };
    type?: { text: string };
  }>;
}

export interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest';
  id: string;
  status: 'active' | 'completed' | 'cancelled' | 'stopped';
  intent: 'proposal' | 'plan' | 'order';
  medicationCodeableConcept: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  encounter?: {
    reference: string;
  };
  authoredOn: string;
  requester: {
    reference: string;
    display: string;
  };
  dosageInstruction?: Array<{
    text: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
    route?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    doseAndRate?: Array<{
      doseQuantity?: {
        value: number;
        unit: string;
      };
    }>;
  }>;
  dispenseRequest?: {
    quantity?: {
      value: number;
      unit: string;
    };
  };
}

/**
 * FHIR API CLIENT
 */
export class FHIRAPIClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * OAuth 2.0 Authentication
   */
  async authenticate(clientId: string, clientSecret: string, scope: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope
      })
    });

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  /**
   * GET Patient by ID
   */
  async getPatient(patientId: string): Promise<FHIRPatient> {
    return this.request<FHIRPatient>('GET', `/Patient/${patientId}`);
  }

  /**
   * SEARCH Patients
   */
  async searchPatients(params: {
    identifier?: string;
    family?: string;
    given?: string;
    birthdate?: string;
    gender?: string;
  }): Promise<{ entry: Array<{ resource: FHIRPatient }> }> {
    const queryParams = new URLSearchParams(params as any);
    return this.request('GET', `/Patient?${queryParams}`);
  }

  /**
   * CREATE Patient
   */
  async createPatient(patient: FHIRPatient): Promise<FHIRPatient> {
    return this.request<FHIRPatient>('POST', '/Patient', patient);
  }

  /**
   * UPDATE Patient
   */
  async updatePatient(patientId: string, patient: FHIRPatient): Promise<FHIRPatient> {
    return this.request<FHIRPatient>('PUT', `/Patient/${patientId}`, patient);
  }

  /**
   * GET Observations (Vitals, Labs)
   */
  async getObservations(patientId: string, category?: string): Promise<{ entry: Array<{ resource: FHIRObservation }> }> {
    let url = `/Observation?subject=Patient/${patientId}`;
    if (category) url += `&category=${category}`;
    return this.request('GET', url);
  }

  /**
   * CREATE Observation
   */
  async createObservation(observation: FHIRObservation): Promise<FHIRObservation> {
    return this.request<FHIRObservation>('POST', '/Observation', observation);
  }

  /**
   * GET Medication Requests
   */
  async getMedicationRequests(patientId: string): Promise<{ entry: Array<{ resource: FHIRMedicationRequest }> }> {
    return this.request('GET', `/MedicationRequest?subject=Patient/${patientId}`);
  }

  /**
   * Generic Request Handler
   */
  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`FHIR API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * CONVERTERS: AfyaCare → FHIR
 */
export class FHIRConverter {
  /**
   * Convert AfyaCare Patient to FHIR Patient
   */
  static patientToFHIR(patient: Patient): FHIRPatient {
    return {
      resourceType: 'Patient',
      id: patient.patient_id,
      identifier: [
        {
          system: 'http://afyacare.go.tz/patient-id',
          value: patient.afya_id,
          type: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MR',
              display: 'Medical Record Number'
            }]
          }
        }
      ],
      active: true,
      name: [{
        use: 'official',
        family: patient.last_name,
        given: [patient.first_name, patient.middle_name].filter(Boolean) as string[]
      }],
      telecom: patient.phone_number ? [{
        system: 'phone',
        value: patient.phone_number,
        use: 'mobile'
      }] : undefined,
      gender: patient.sex === 'male' ? 'male' : patient.sex === 'female' ? 'female' : 'other',
      birthDate: patient.date_of_birth.toISOString().split('T')[0],
      address: patient.address ? [{
        use: 'home',
        type: 'physical',
        text: patient.address,
        district: patient.district,
        state: patient.region,
        country: 'Tanzania'
      }] : undefined
    };
  }

  /**
   * Convert Vital Signs to FHIR Observation
   */
  static vitalsToFHIR(vitals: VitalSigns, patientId: string, encounterId: string): FHIRObservation[] {
    const observations: FHIRObservation[] = [];

    // Blood Pressure
    if (vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic) {
      observations.push({
        resourceType: 'Observation',
        id: `${vitals.vital_id}-bp`,
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '85354-9',
            display: 'Blood Pressure'
          }]
        },
        subject: { reference: `Patient/${patientId}`, display: '' },
        encounter: { reference: `Encounter/${encounterId}` },
        effectiveDateTime: vitals.recorded_at.toISOString(),
        valueString: `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`
      });
    }

    // Temperature
    if (vitals.temperature) {
      observations.push({
        resourceType: 'Observation',
        id: `${vitals.vital_id}-temp`,
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8310-5',
            display: 'Body Temperature'
          }]
        },
        subject: { reference: `Patient/${patientId}`, display: '' },
        encounter: { reference: `Encounter/${encounterId}` },
        effectiveDateTime: vitals.recorded_at.toISOString(),
        valueQuantity: {
          value: vitals.temperature,
          unit: '°C',
          system: 'http://unitsofmeasure.org',
          code: 'Cel'
        }
      });
    }

    return observations;
  }

  /**
   * Convert Lab Result to FHIR Observation
   */
  static labResultToFHIR(result: LabResult, patientId: string): FHIRObservation {
    return {
      resourceType: 'Observation',
      id: result.result_id,
      status: result.verified_at ? 'final' : 'preliminary',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'laboratory',
          display: 'Laboratory'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: result.loinc_code || '',
          display: result.test_name
        }],
        text: result.test_name
      },
      subject: { reference: `Patient/${patientId}`, display: '' },
      effectiveDateTime: result.result_date.toISOString(),
      valueQuantity: typeof result.result_value === 'number' ? {
        value: result.result_value,
        unit: result.unit || '',
        system: 'http://unitsofmeasure.org',
        code: result.unit || ''
      } : undefined,
      valueString: typeof result.result_value === 'string' ? result.result_value : undefined,
      interpretation: result.interpretation ? [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
          code: result.interpretation === 'high' ? 'H' : result.interpretation === 'low' ? 'L' : 'N',
          display: result.interpretation
        }]
      }] : undefined
    };
  }

  /**
   * Convert Prescription to FHIR MedicationRequest
   */
  static prescriptionToFHIR(rx: Prescription, patientId: string, encounterId: string): FHIRMedicationRequest {
    return {
      resourceType: 'MedicationRequest',
      id: rx.prescription_id,
      status: rx.status === 'dispensed' ? 'completed' : rx.status === 'cancelled' ? 'cancelled' : 'active',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [],
        text: rx.medication_name
      },
      subject: { reference: `Patient/${patientId}`, display: '' },
      encounter: { reference: `Encounter/${encounterId}` },
      authoredOn: rx.prescribed_date.toISOString(),
      requester: { reference: `Practitioner/${rx.prescriber_id}`, display: '' },
      dosageInstruction: [{
        text: rx.instructions
      }],
      dispenseRequest: {
        quantity: {
          value: rx.quantity,
          unit: 'tablets'
        }
      }
    };
  }
}

/**
 * EXAMPLE USAGE
 */
export async function exampleFHIRUsage() {
  // Initialize client
  const client = new FHIRAPIClient('https://fhir.afyacare.go.tz/fhir');
  
  // Authenticate
  await client.authenticate('facility-001', 'secret', 'patient/*.read patient/*.write');
  
  // Search for patient
  const searchResults = await client.searchPatients({
    identifier: 'AFY-001-2024'
  });
  
  // Get patient vitals
  const vitals = await client.getObservations('pat-001', 'vital-signs');
  
  // Get lab results
  const labs = await client.getObservations('pat-001', 'laboratory');
  
  // Get medications
  const meds = await client.getMedicationRequests('pat-001');
  
}
