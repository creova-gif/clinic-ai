/**
 * AfyaCare Tanzania - Hospital-Grade Data Model
 * 
 * PRODUCTION DATABASE SCHEMA
 * Designed for national-scale hospital operations
 * 
 * Supports:
 * - Master Patient Index (MPI)
 * - Clinical Documentation (SOAP)
 * - Pharmacy Workflow
 * - Laboratory Integration
 * - Queue Management
 * - MoH Reporting
 * - FHIR Interoperability
 * - Immutable Audit Trail
 */

// ===========================================
// 1. MASTER PATIENT INDEX (MPI)
// ===========================================

export interface Patient {
  // Core Identity
  patient_id: string;                    // UUID - Primary Key
  mpi_id: string | null;                 // Master Patient Index ID (cross-facility)
  national_id: string | null;            // Tanzania National ID
  afya_id: string;                       // AfyaCare Unique ID (visible to patient)
  
  // Demographics
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: Date;
  estimated_dob: boolean;                // If DOB is estimated
  gender: 'male' | 'female' | 'other' | 'unknown';
  
  // Contact
  phone_primary: string;
  phone_secondary: string | null;
  email: string | null;
  
  // Address
  region: string;
  district: string;
  ward: string | null;
  village: string | null;
  street_address: string | null;
  
  // Medical
  blood_type: string | null;             // A+, B+, AB+, O+, etc.
  allergies: string[];                   // Drug/food allergies
  chronic_conditions: string[];          // ICD-10 codes
  
  // Facility
  primary_facility_id: string;           // Home facility
  registered_facility_id: string;        // Where first registered
  
  // Consent & Privacy
  consent_data_sharing: boolean;
  consent_research: boolean;
  consent_sms: boolean;
  
  // Status
  status: 'active' | 'inactive' | 'deceased' | 'merged';
  merged_into_patient_id: string | null; // If duplicate merged
  deceased_date: Date | null;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by_user_id: string;
  updated_by_user_id: string;
}

export interface MasterPatientIndex {
  mpi_id: string;                        // UUID - Global patient identifier
  linked_patient_ids: string[];          // All patient_ids for same person
  
  // Duplicate Detection
  duplicate_score: number;               // 0-100 similarity score
  duplicate_flags: {
    name_match: boolean;
    dob_match: boolean;
    phone_match: boolean;
    national_id_match: boolean;
  };
  
  // Merge History
  merge_history: Array<{
    merged_from_patient_id: string;
    merged_into_patient_id: string;
    merged_by_user_id: string;
    merged_at: Date;
    reason: string;
    reversible: boolean;
  }>;
  
  // Cross-Facility
  facilities_visited: Array<{
    facility_id: string;
    first_visit: Date;
    last_visit: Date;
    visit_count: number;
  }>;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// 2. CLINICAL ENCOUNTERS
// ===========================================

export interface Encounter {
  encounter_id: string;                  // UUID
  patient_id: string;                    // FK to Patient
  mpi_id: string | null;                 // FK to MPI
  
  // Facility & Provider
  facility_id: string;                   // FK to Facility
  department: string;                    // OPD, IPD, Emergency, Antenatal, etc.
  provider_id: string;                   // FK to User (doctor/clinical officer)
  
  // Type & Status
  encounter_type: 'outpatient' | 'inpatient' | 'emergency' | 'antenatal' | 'postnatal' | 'immunization';
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  priority: 'routine' | 'urgent' | 'emergency';
  
  // Chief Complaint
  chief_complaint: string;
  presenting_symptoms: string[];
  
  // Triage
  triage_category: 1 | 2 | 3 | 4 | 5;    // 1=Immediate, 5=Non-urgent
  triage_by_user_id: string | null;
  triage_timestamp: Date | null;
  ai_triage_score: number | null;        // AI risk assessment
  
  // Timing
  scheduled_at: Date | null;
  checked_in_at: Date | null;
  consultation_started_at: Date | null;
  consultation_ended_at: Date | null;
  
  // Referral
  referred_from_facility_id: string | null;
  referred_to_facility_id: string | null;
  referral_reason: string | null;
  
  // Disposition
  disposition: 'discharged' | 'admitted' | 'referred' | 'follow-up' | 'deceased';
  follow_up_date: Date | null;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by_user_id: string;
}

// ===========================================
// 3. CLINICAL DOCUMENTATION (SOAP)
// ===========================================

export interface ClinicalNote {
  note_id: string;                       // UUID
  encounter_id: string;                  // FK to Encounter
  patient_id: string;                    // FK to Patient
  
  // SOAP Structure
  subjective: string;                    // Patient's description
  objective: string;                     // Clinical findings
  assessment: string;                    // Diagnosis/assessment
  plan: string;                          // Treatment plan
  
  // Diagnosis
  primary_diagnosis_icd10: string;       // ICD-10 code
  primary_diagnosis_text: string;
  secondary_diagnoses: Array<{
    icd10_code: string;
    diagnosis_text: string;
  }>;
  
  // Procedures
  procedures_performed: Array<{
    procedure_code: string;              // CPT or local code
    procedure_name: string;
    performed_by_user_id: string;
    performed_at: Date;
  }>;
  
  // Clinical Decision Support
  differential_diagnoses: string[];
  red_flags: string[];
  ai_suggestions: string[];
  
  // Attachments
  attachment_urls: string[];             // Lab results, images, etc.
  
  // Signature & Review
  signed_by_user_id: string;
  signed_at: Date;
  signature_hash: string;                // Digital signature verification
  reviewed_by_user_id: string | null;   // For teaching hospitals
  reviewed_at: Date | null;
  
  // Version Control
  version: number;
  previous_version_id: string | null;
  revision_reason: string | null;
  
  // Status
  status: 'draft' | 'signed' | 'amended' | 'archived';
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// 4. VITAL SIGNS
// ===========================================

export interface VitalSigns {
  vitals_id: string;                     // UUID
  encounter_id: string;                  // FK to Encounter
  patient_id: string;                    // FK to Patient
  
  // Measurements
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;             // bpm
  respiratory_rate: number | null;       // breaths/min
  temperature: number | null;            // Celsius
  oxygen_saturation: number | null;      // %
  weight: number | null;                 // kg
  height: number | null;                 // cm
  bmi: number | null;                    // Calculated
  
  // Pregnancy-Specific (if applicable)
  fundal_height: number | null;          // cm
  fetal_heart_rate: number | null;       // bpm
  
  // Pain Assessment
  pain_scale: number | null;             // 0-10
  
  // Flags
  abnormal_flags: Array<{
    parameter: string;
    value: number;
    reference_range: string;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
  
  // Recording
  recorded_by_user_id: string;
  recorded_at: Date;
  method: 'manual' | 'device' | 'patient-reported';
  device_id: string | null;
  
  // Metadata
  created_at: Date;
}

// ===========================================
// 5. PHARMACY MODULE
// ===========================================

export interface Prescription {
  prescription_id: string;               // UUID
  encounter_id: string;                  // FK to Encounter
  patient_id: string;                    // FK to Patient
  
  // Prescriber
  prescribed_by_user_id: string;         // FK to User (doctor)
  prescribed_at: Date;
  
  // Medication
  drug_id: string;                       // FK to Drug
  drug_name: string;
  drug_form: string;                     // Tablet, Syrup, Injection, etc.
  strength: string;                      // 500mg, 5ml, etc.
  
  // Dosing
  dose: string;                          // "2 tablets"
  frequency: string;                     // "twice daily", "every 8 hours"
  route: string;                         // Oral, IV, IM, etc.
  duration_days: number;
  quantity_prescribed: number;
  
  // Instructions
  instructions: string;                  // "Take with food"
  indication: string;                    // "For malaria treatment"
  
  // Safety
  drug_interactions: string[];           // Warnings
  contraindications: string[];
  
  // Dispensing
  status: 'pending' | 'dispensed' | 'partially-dispensed' | 'cancelled';
  dispensed_by_user_id: string | null;   // FK to User (pharmacist)
  dispensed_at: Date | null;
  quantity_dispensed: number | null;
  batch_number: string | null;
  expiry_date: Date | null;
  
  // Refills
  refills_allowed: number;
  refills_remaining: number;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface Drug {
  drug_id: string;                       // UUID
  generic_name: string;
  brand_names: string[];
  category: string;                      // Antibiotic, Analgesic, etc.
  controlled_substance: boolean;
  requires_prescription: boolean;
  
  // Inventory (per facility)
  inventory: Array<{
    facility_id: string;
    quantity_available: number;
    reorder_level: number;
    batch_number: string;
    expiry_date: Date;
    unit_price: number;
  }>;
  
  // Clinical
  interactions: string[];                // Drug interaction warnings
  contraindications: string[];
  pregnancy_category: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// 6. LABORATORY MODULE
// ===========================================

export interface LabOrder {
  lab_order_id: string;                  // UUID
  encounter_id: string;                  // FK to Encounter
  patient_id: string;                    // FK to Patient
  
  // Order Details
  ordered_by_user_id: string;            // FK to User (doctor)
  ordered_at: Date;
  test_type: string;                     // "Blood Count", "Malaria Test", etc.
  test_code: string;                     // LOINC code if available
  
  // Priority & Status
  priority: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'specimen-collected' | 'in-progress' | 'completed' | 'cancelled';
  
  // Specimen
  specimen_type: string;                 // Blood, Urine, Stool, etc.
  specimen_collected_at: Date | null;
  specimen_collected_by_user_id: string | null;
  
  // Clinical Info
  clinical_indication: string;
  fasting_required: boolean;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface LabResult {
  result_id: string;                     // UUID
  lab_order_id: string;                  // FK to LabOrder
  patient_id: string;                    // FK to Patient
  
  // Result Values (Structured)
  test_name: string;
  result_value: string;                  // Can be numeric or text
  result_unit: string | null;            // mg/dL, mmol/L, etc.
  reference_range_low: number | null;
  reference_range_high: number | null;
  reference_range_text: string | null;   // For non-numeric
  
  // Interpretation
  abnormal_flag: 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high' | 'abnormal';
  interpretation: string | null;
  comments: string | null;
  
  // Attachments
  attachment_urls: string[];             // PDF reports, images
  
  // Lab Tech
  performed_by_user_id: string;
  verified_by_user_id: string | null;    // Supervisor verification
  performed_at: Date;
  verified_at: Date | null;
  
  // Equipment
  analyzer_id: string | null;
  method: string | null;
  
  // Status
  status: 'preliminary' | 'final' | 'corrected' | 'cancelled';
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// 7. QUEUE MANAGEMENT
// ===========================================

export interface QueueEntry {
  queue_id: string;                      // UUID
  patient_id: string;                    // FK to Patient
  encounter_id: string;                  // FK to Encounter
  facility_id: string;                   // FK to Facility
  
  // Queue Details
  department: string;                    // OPD, Emergency, Antenatal, etc.
  queue_number: number;                  // Display number
  arrival_time: Date;
  triage_priority: 1 | 2 | 3 | 4 | 5;
  
  // Assignment
  assigned_to_user_id: string | null;    // Assigned provider
  assigned_at: Date | null;
  
  // Status
  status: 'waiting' | 'in-consultation' | 'completed' | 'left-without-seen';
  called_at: Date | null;
  consultation_started_at: Date | null;
  completed_at: Date | null;
  
  // Estimated Wait
  estimated_wait_minutes: number | null;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// 8. FACILITY MANAGEMENT
// ===========================================

export interface Facility {
  facility_id: string;                   // UUID
  
  // Identity
  facility_name: string;
  facility_code: string;                 // MoH facility code
  facility_type: 'dispensary' | 'health-centre' | 'district-hospital' | 'regional-hospital' | 'referral-hospital' | 'private-clinic' | 'pharmacy' | 'laboratory';
  
  // Location
  region: string;
  district: string;
  ward: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
  
  // Contact
  phone: string | null;
  email: string | null;
  
  // Services
  services_offered: string[];            // OPD, IPD, Maternity, Lab, Pharmacy, etc.
  departments: string[];
  
  // Capacity
  bed_capacity: number | null;
  staff_count: number;
  
  // Registration
  license_number: string;
  license_expiry: Date;
  tmda_registered: boolean;
  nhif_accredited: boolean;
  
  // Status
  status: 'active' | 'inactive' | 'suspended';
  operational_hours: string;
  
  // Ownership
  ownership: 'government' | 'private' | 'faith-based' | 'ngo';
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// 9. USER & ROLES
// ===========================================

export interface User {
  user_id: string;                       // UUID
  
  // Identity
  username: string;
  email: string;
  phone: string;
  
  // Profile
  first_name: string;
  last_name: string;
  title: string | null;                  // Dr., Nurse, etc.
  
  // Role
  role: 'receptionist' | 'nurse' | 'clinical-officer' | 'doctor' | 'pharmacist' | 'lab-tech' | 'radiologist' | 'chw' | 'admin' | 'moh-admin';
  specialization: string | null;         // Cardiology, Pediatrics, etc.
  
  // Facility
  primary_facility_id: string;
  facilities_access: string[];           // Can access multiple facilities
  
  // Credentials
  license_number: string | null;
  license_expiry: Date | null;
  
  // Permissions
  permissions: string[];                 // Granular permissions
  
  // Authentication
  password_hash: string;
  biometric_enabled: boolean;
  two_factor_enabled: boolean;
  
  // Status
  status: 'active' | 'inactive' | 'suspended';
  last_login_at: Date | null;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// 10. AUDIT TRAIL (IMMUTABLE)
// ===========================================

export interface AuditLog {
  audit_id: string;                      // UUID - Immutable
  
  // Who
  user_id: string;
  user_role: string;
  user_name: string;
  
  // What
  action: 'create' | 'read' | 'update' | 'delete' | 'sign' | 'verify' | 'dispense' | 'merge' | 'export';
  entity_type: 'patient' | 'encounter' | 'note' | 'prescription' | 'lab-order' | 'lab-result' | 'user' | 'facility';
  entity_id: string;
  
  // When
  timestamp: Date;
  
  // Where
  facility_id: string;
  ip_address: string;
  user_agent: string;
  
  // Details
  changes: Array<{
    field: string;
    old_value: any;
    new_value: any;
  }>;
  
  // Context
  reason: string | null;                 // Why the action was taken
  patient_accessed: string | null;       // Patient ID if PHI accessed
  
  // Integrity
  hash: string;                          // SHA-256 of audit record
  previous_hash: string | null;          // Blockchain-style chaining
  
  // GDPR/PDPA
  data_category: 'personal' | 'medical' | 'administrative' | 'system';
  
  // Metadata (Immutable)
  created_at: Date;                      // Cannot be updated
}

// ===========================================
// 11. MoH REPORTING
// ===========================================

export interface MoHReport {
  report_id: string;
  report_type: 'monthly-opd' | 'maternal-health' | 'malaria-cases' | 'tb-cases' | 'mortality' | 'disease-surveillance' | 'facility-capacity';
  
  // Period
  reporting_period_start: Date;
  reporting_period_end: Date;
  
  // Facility
  facility_id: string;
  facility_name: string;
  region: string;
  district: string;
  
  // Data
  data: any;                             // Structured JSON based on report type
  
  // Submission
  generated_by_user_id: string;
  generated_at: Date;
  submitted_to_moh: boolean;
  submitted_at: Date | null;
  
  // Export
  export_format: 'csv' | 'dhis2' | 'pdf';
  export_url: string | null;
  
  // Metadata
  created_at: Date;
}

// ===========================================
// 12. INTEROPERABILITY (FHIR)
// ===========================================

export interface FHIRMapping {
  mapping_id: string;
  
  // Internal → FHIR
  internal_entity_type: string;          // 'patient', 'encounter', etc.
  internal_entity_id: string;
  
  fhir_resource_type: string;            // 'Patient', 'Encounter', etc.
  fhir_resource_id: string;
  fhir_resource_url: string;
  
  // Sync
  last_synced_at: Date;
  sync_status: 'pending' | 'synced' | 'failed';
  sync_error: string | null;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// TYPE EXPORTS
// ===========================================

