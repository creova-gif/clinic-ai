export interface Appointment {
  id: string;
  facility: string;
  type: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
  doctor: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  takenToday: boolean;
  reminderTime: string;
  notes: string;
  active: boolean;
}

export interface TestResult {
  id: string;
  type: string;
  date: string;
  status: 'completed' | 'pending';
  facility: string;
  reviewedBy: string;
  results: Array<{ label: string; value: string; unit: string; status: 'normal' | 'abnormal' | 'pending' }>;
}

export interface Facility {
  id: string;
  name: string;
  nameSw: string;
  type: 'hospital' | 'clinic' | 'dispensary';
  address: string;
  phone: string;
  distance: string;
  open: boolean;
  services: string[];
}

export interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  recordedAt: string;
}

export const mockAppointments: Appointment[] = [
  {
    id: 'apt_001',
    facility: 'Muhimbili National Hospital',
    type: 'General Checkup',
    date: '2026-06-10',
    time: '10:00',
    status: 'scheduled',
    reason: 'Annual physical examination',
    doctor: 'Dr. Amani Mwamba',
  },
  {
    id: 'apt_002',
    facility: 'Temeke District Hospital',
    type: 'Maternal Care',
    date: '2026-06-18',
    time: '14:30',
    status: 'scheduled',
    reason: 'Week 32 pregnancy checkup',
    doctor: 'Dr. Neema Kamwela',
  },
  {
    id: 'apt_003',
    facility: 'Muhimbili National Hospital',
    type: 'Lab Results Review',
    date: '2026-05-15',
    time: '09:00',
    status: 'completed',
    reason: 'Review CBC results',
    doctor: 'Dr. Amani Mwamba',
  },
];

export const mockMedications: Medication[] = [
  {
    id: 'med_001',
    name: 'Prenatal Vitamins',
    dosage: '1 tablet',
    frequency: 'Once daily',
    takenToday: true,
    reminderTime: '09:00',
    notes: 'Take with food',
    active: true,
  },
  {
    id: 'med_002',
    name: 'Folic Acid',
    dosage: '400mcg',
    frequency: 'Once daily',
    takenToday: false,
    reminderTime: '09:00',
    notes: '',
    active: true,
  },
  {
    id: 'med_003',
    name: 'Iron Supplement',
    dosage: '65mg',
    frequency: 'Once daily',
    takenToday: false,
    reminderTime: '13:00',
    notes: 'Take with vitamin C for better absorption',
    active: true,
  },
];

export const mockTestResults: TestResult[] = [
  {
    id: 'test_001',
    type: 'Complete Blood Count (CBC)',
    date: '2026-05-15',
    status: 'completed',
    facility: 'Muhimbili National Hospital',
    reviewedBy: 'Dr. Amani Mwamba',
    results: [
      { label: 'WBC', value: '7.2', unit: '10⁹/L', status: 'normal' },
      { label: 'Hemoglobin', value: '13.5', unit: 'g/dL', status: 'normal' },
      { label: 'Platelets', value: '250', unit: '10⁹/L', status: 'normal' },
    ],
  },
  {
    id: 'test_002',
    type: 'Blood Glucose',
    date: '2026-05-15',
    status: 'completed',
    facility: 'Muhimbili National Hospital',
    reviewedBy: 'Dr. Amani Mwamba',
    results: [
      { label: 'Glucose', value: '95', unit: 'mg/dL', status: 'normal' },
    ],
  },
  {
    id: 'test_003',
    type: 'Ultrasound',
    date: '2026-05-20',
    status: 'completed',
    facility: 'Temeke District Hospital',
    reviewedBy: 'Dr. Neema Kamwela',
    results: [
      { label: 'Fetal Heartbeat', value: '148', unit: 'bpm', status: 'normal' },
      { label: 'Gestational Age', value: '28 weeks', unit: '', status: 'normal' },
    ],
  },
];

export const mockFacilities: Facility[] = [
  {
    id: 'fac_001',
    name: 'Muhimbili National Hospital',
    nameSw: 'Hospitali ya Taifa ya Muhimbili',
    type: 'hospital',
    address: 'United Nations Road, Ilala, Dar es Salaam',
    phone: '+255 22 215 0302',
    distance: '2.3',
    open: true,
    services: ['Emergency', 'Maternity', 'Surgery', 'Laboratory', 'Pharmacy'],
  },
  {
    id: 'fac_002',
    name: 'Temeke District Hospital',
    nameSw: 'Hospitali ya Wilaya ya Temeke',
    type: 'hospital',
    address: 'Temeke, Dar es Salaam',
    phone: '+255 22 264 0396',
    distance: '4.1',
    open: true,
    services: ['Emergency', 'Maternity', 'Outpatient', 'Laboratory'],
  },
  {
    id: 'fac_003',
    name: 'Kinondoni Health Centre',
    nameSw: 'Zahanati ya Kinondoni',
    type: 'clinic',
    address: 'Kinondoni, Dar es Salaam',
    phone: '+255 22 270 1234',
    distance: '1.2',
    open: true,
    services: ['Outpatient', 'Maternal Health', 'Immunization'],
  },
  {
    id: 'fac_004',
    name: 'Mwananyamala Regional Hospital',
    nameSw: 'Hospitali ya Mkoa ya Mwananyamala',
    type: 'hospital',
    address: 'Mwananyamala, Dar es Salaam',
    phone: '+255 22 290 0113',
    distance: '5.7',
    open: false,
    services: ['Emergency', 'Surgery', 'Radiology', 'Laboratory'],
  },
  {
    id: 'fac_005',
    name: 'Mbagala Dispensary',
    nameSw: 'Zahanati ya Mbagala',
    type: 'dispensary',
    address: 'Mbagala, Dar es Salaam',
    phone: '+255 22 286 5432',
    distance: '7.2',
    open: true,
    services: ['Outpatient', 'Immunization', 'HIV/AIDS care'],
  },
];

export const mockVitals: VitalSigns = {
  bloodPressure: '118/76',
  heartRate: 72,
  temperature: 36.8,
  weight: 68,
  recordedAt: '2026-05-15T10:00:00Z',
};

export const commonSymptoms = [
  { id: 's1', name: 'Headache', nameSw: 'Maumivu ya kichwa', icon: 'head' },
  { id: 's2', name: 'Fever', nameSw: 'Homa', icon: 'thermometer' },
  { id: 's3', name: 'Cough', nameSw: 'Kukohoa', icon: 'wind' },
  { id: 's4', name: 'Fatigue', nameSw: 'Uchovu', icon: 'battery-low' },
  { id: 's5', name: 'Nausea', nameSw: 'Kichefuchefu', icon: 'alert-circle' },
  { id: 's6', name: 'Stomach Pain', nameSw: 'Maumivu ya tumbo', icon: 'circle' },
  { id: 's7', name: 'Chest Pain', nameSw: 'Maumivu ya kifua', icon: 'heart' },
  { id: 's8', name: 'Shortness of Breath', nameSw: 'Ugumu wa kupumua', icon: 'wind' },
  { id: 's9', name: 'Dizziness', nameSw: 'Kizunguzungu', icon: 'refresh-cw' },
  { id: 's10', name: 'Back Pain', nameSw: 'Maumivu ya mgongo', icon: 'minus' },
  { id: 's11', name: 'Sore Throat', nameSw: 'Maumivu ya koo', icon: 'mic-off' },
  { id: 's12', name: 'Rash', nameSw: 'Upele', icon: 'droplet' },
];
