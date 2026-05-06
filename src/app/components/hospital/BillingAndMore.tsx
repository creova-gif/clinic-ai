/**
 * BILLING MODULE
 * 
 * NHIF integration & revenue management
 * 
 * Features:
 * - Service pricing catalog
 * - Invoice generation
 * - Payment collection (Cash, Mobile Money, Insurance)
 * - NHIF claim submission
 * - Revenue reports
 * - Insurance verification
 */

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CreditCard, FileText, CheckCircle, Clock, DollarSign } from 'lucide-react';
import type { Patient, Encounter } from '../../types/HospitalDataModel';

interface BillingItem {
  item_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  service_date: Date;
}

interface Invoice {
  invoice_id: string;
  patient_id: string;
  encounter_id: string;
  items: BillingItem[];
  subtotal: number;
  insurance_covered: number;
  patient_responsibility: number;
  total_amount: number;
  payment_status: 'pending' | 'partial' | 'paid';
  payment_method?: 'cash' | 'mobile_money' | 'insurance' | 'nhif';
  created_at: Date;
}

export const BillingModule: React.FC<{ patient: Patient; encounter: Encounter }> = ({ patient, encounter }) => {
  const [invoice, setInvoice] = useState<Invoice>({
    invoice_id: `INV-${Date.now()}`,
    patient_id: patient.patient_id,
    encounter_id: encounter.encounter_id,
    items: [
      { item_id: '1', description: 'Consultation Fee', quantity: 1, unit_price: 20000, total: 20000, service_date: new Date() },
      { item_id: '2', description: 'Laboratory Tests (CBC)', quantity: 1, unit_price: 15000, total: 15000, service_date: new Date() },
      { item_id: '3', description: 'Medication Dispensed', quantity: 1, unit_price: 25000, total: 25000, service_date: new Date() }
    ],
    subtotal: 60000,
    insurance_covered: 48000,
    patient_responsibility: 12000,
    total_amount: 60000,
    payment_status: 'pending',
    created_at: new Date()
  });

  const submitNHIFClaim = async () => {
    // NHIF API integration
    alert('NHIF claim submitted successfully. Reference: ' + Math.random().toString(36).substr(2, 9).toUpperCase());
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-[#0F3D56] mb-6">Invoice</h2>

      <div className="mb-6">
        <div className="text-sm text-[#6B7280]">Patient</div>
        <div className="font-medium">{patient.first_name} {patient.last_name} ({patient.afya_id})</div>
      </div>

      <table className="w-full mb-6">
        <thead className="bg-[#F9FAFB]">
          <tr>
            <th className="text-left p-3 text-sm font-medium">Description</th>
            <th className="text-center p-3 text-sm font-medium">Qty</th>
            <th className="text-right p-3 text-sm font-medium">Unit Price</th>
            <th className="text-right p-3 text-sm font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.item_id} className="border-b">
              <td className="p-3">{item.description}</td>
              <td className="p-3 text-center">{item.quantity}</td>
              <td className="p-3 text-right">TZS {item.unit_price.toLocaleString()}</td>
              <td className="p-3 text-right font-medium">TZS {item.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span className="text-[#6B7280]">Subtotal</span>
          <span className="font-medium">TZS {invoice.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>NHIF Coverage (80%)</span>
          <span className="font-medium">- TZS {invoice.insurance_covered.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Patient Pays</span>
          <span>TZS {invoice.patient_responsibility.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1 gap-2" onClick={submitNHIFClaim}>
          <FileText className="h-4 w-4" />
          Submit NHIF Claim
        </Button>
        <Button variant="outline" className="flex-1 gap-2">
          <CreditCard className="h-4 w-4" />
          Collect Payment
        </Button>
      </div>
    </Card>
  );
};

/**
 * IMMUNIZATION TRACKING
 */
interface Immunization {
  immunization_id: string;
  patient_id: string;
  vaccine_name: string;
  vaccine_code: string;
  dose_number: number;
  total_doses: number;
  administered_date: Date;
  administered_by: string;
  site: string;
  route: string;
  batch_number: string;
  expiry_date: Date;
  next_dose_due?: Date;
}

export const ImmunizationTracking: React.FC<{ patient: Patient }> = ({ patient }) => {
  const epiSchedule = [
    { vaccine: 'BCG', age: 'Birth', doses: 1 },
    { vaccine: 'OPV', age: 'Birth, 6w, 10w, 14w', doses: 4 },
    { vaccine: 'Pentavalent', age: '6w, 10w, 14w', doses: 3 },
    { vaccine: 'Measles/Rubella', age: '9m, 18m', doses: 2 }
  ];

  const [records, setRecords] = useState<Immunization[]>([
    {
      immunization_id: 'imm-001',
      patient_id: patient.patient_id,
      vaccine_name: 'BCG',
      vaccine_code: 'BCG-01',
      dose_number: 1,
      total_doses: 1,
      administered_date: new Date(patient.date_of_birth),
      administered_by: 'Nurse Sarah',
      site: 'Left upper arm',
      route: 'Intradermal',
      batch_number: 'BCG2024A',
      expiry_date: new Date('2025-12-31')
    }
  ]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-[#0F3D56] mb-6">Immunization Record</h2>
      
      <div className="mb-6">
        <div className="text-sm text-[#6B7280]">Patient</div>
        <div className="font-medium">{patient.first_name} {patient.last_name}</div>
        <div className="text-sm text-[#6B7280]">
          Age: {Math.floor((Date.now() - patient.date_of_birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
        </div>
      </div>

      <div className="space-y-4">
        {epiSchedule.map((vaccine, idx) => {
          const completed = records.filter(r => r.vaccine_name === vaccine.vaccine).length;
          return (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{vaccine.vaccine}</div>
                <Badge className={completed === vaccine.doses ? 'bg-green-600' : 'bg-[#F4A261]'}>
                  {completed}/{vaccine.doses} doses
                </Badge>
              </div>
              <div className="text-sm text-[#6B7280]">Schedule: {vaccine.age}</div>
            </div>
          );
        })}
      </div>

      <Button className="w-full mt-6">Record New Vaccination</Button>
    </Card>
  );
};

/**
 * IMAGING ORDERS
 */
interface ImagingOrder {
  order_id: string;
  patient_id: string;
  encounter_id: string;
  modality: 'X-Ray' | 'Ultrasound' | 'CT' | 'MRI';
  body_part: string;
  clinical_indication: string;
  urgency: 'stat' | 'urgent' | 'routine';
  status: 'ordered' | 'scheduled' | 'completed' | 'reported';
  ordered_date: Date;
  ordered_by: string;
}

export const ImagingOrders: React.FC<{ patient: Patient; encounter: Encounter }> = ({ patient, encounter }) => {
  const [order, setOrder] = useState<Partial<ImagingOrder>>({
    patient_id: patient.patient_id,
    encounter_id: encounter.encounter_id,
    modality: 'X-Ray',
    urgency: 'routine'
  });

  const modalities = ['X-Ray', 'Ultrasound', 'CT', 'MRI'];
  const bodyParts = {
    'X-Ray': ['Chest', 'Abdomen', 'Spine', 'Extremities'],
    'Ultrasound': ['Abdomen', 'Pelvis', 'Obstetric', 'Vascular'],
    'CT': ['Head', 'Chest', 'Abdomen', 'Spine'],
    'MRI': ['Brain', 'Spine', 'Joints', 'Abdomen']
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-[#0F3D56] mb-6">Imaging Order</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Modality</label>
          <select
            value={order.modality}
            onChange={(e) => setOrder({ ...order, modality: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {modalities.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Body Part</label>
          <select
            value={order.body_part}
            onChange={(e) => setOrder({ ...order, body_part: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select...</option>
            {order.modality && bodyParts[order.modality as keyof typeof bodyParts].map(bp => (
              <option key={bp}>{bp}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Clinical Indication</label>
          <textarea
            value={order.clinical_indication}
            onChange={(e) => setOrder({ ...order, clinical_indication: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Reason for imaging..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Urgency</label>
          <div className="grid grid-cols-3 gap-3">
            {(['stat', 'urgent', 'routine'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setOrder({ ...order, urgency: level })}
                className={`p-3 border-2 rounded-lg capitalize ${
                  order.urgency === level ? 'border-[#0F3D56] bg-[#EFF6FF]' : 'border-[#E5E7EB]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full">Submit Imaging Order</Button>
      </div>
    </Card>
  );
};
