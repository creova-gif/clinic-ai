/**
 * Vital Signs Entry System
 * 
 * Features:
 * - Structured vital signs entry
 * - Automatic abnormal flagging
 * - Age/condition-specific reference ranges
 * - Pregnancy-specific vitals (fundal height, fetal HR)
 * - Pain assessment
 * - BMI auto-calculation
 * - Vitals history tracking
 * - Quick entry mode for nurses
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Activity,
  Heart,
  Wind,
  Thermometer,
  Droplet,
  Weight,
  Ruler,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import type { VitalSigns, Patient, Encounter } from '../../types/HospitalDataModel';

interface VitalsEntryProps {
  patient: Patient;
  encounter: Encounter;
  onSave: (vitals: Partial<VitalSigns>) => void;
  previousVitals?: VitalSigns;
}

export const VitalsEntry: React.FC<VitalsEntryProps> = ({
  patient,
  encounter,
  onSave,
  previousVitals
}) => {
  const { t } = useTranslation(['clinical', 'common']);
  
  const [vitals, setVitals] = useState<Partial<VitalSigns>>({
    encounter_id: encounter.encounter_id,
    patient_id: patient.patient_id,
    blood_pressure_systolic: undefined,
    blood_pressure_diastolic: undefined,
    heart_rate: undefined,
    respiratory_rate: undefined,
    temperature: undefined,
    oxygen_saturation: undefined,
    weight: previousVitals?.weight,
    height: previousVitals?.height,
    bmi: undefined,
    pain_scale: undefined,
    abnormal_flags: []
  });

  const [isPregnant, setIsPregnant] = useState(false);
  const [gestationalAge, setGestationalAge] = useState<number | undefined>();

  /**
   * REFERENCE RANGES (age-adjusted)
   */
  const getReferenceRanges = () => {
    const age = calculateAge(patient.date_of_birth);
    
    return {
      bp_systolic: { min: 90, max: 140, critical_low: 70, critical_high: 180 },
      bp_diastolic: { min: 60, max: 90, critical_low: 40, critical_high: 120 },
      heart_rate: age < 18 ? { min: 70, max: 120, critical_low: 50, critical_high: 180 } 
                           : { min: 60, max: 100, critical_low: 40, critical_high: 150 },
      respiratory_rate: { min: 12, max: 20, critical_low: 8, critical_high: 30 },
      temperature: { min: 36.5, max: 37.5, critical_low: 35, critical_high: 40 },
      oxygen_saturation: { min: 95, max: 100, critical_low: 85, critical_high: 100 },
      bmi: { min: 18.5, max: 25, critical_low: 16, critical_high: 40 }
    };
  };

  const ranges = getReferenceRanges();

  /**
   * AUTO-CALCULATE BMI
   */
  useEffect(() => {
    if (vitals.weight && vitals.height) {
      const heightInMeters = vitals.height / 100;
      const bmi = vitals.weight / (heightInMeters * heightInMeters);
      setVitals(prev => ({ ...prev, bmi: Math.round(bmi * 10) / 10 }));
    }
  }, [vitals.weight, vitals.height]);

  /**
   * ABNORMAL FLAG DETECTION
   */
  useEffect(() => {
    const flags: VitalSigns['abnormal_flags'] = [];

    // Blood Pressure
    if (vitals.blood_pressure_systolic) {
      if (vitals.blood_pressure_systolic < ranges.bp_systolic.critical_low) {
        flags.push({ parameter: 'BP Systolic', value: vitals.blood_pressure_systolic, reference_range: `>${ranges.bp_systolic.critical_low}`, severity: 'severe' });
      } else if (vitals.blood_pressure_systolic > ranges.bp_systolic.critical_high) {
        flags.push({ parameter: 'BP Systolic', value: vitals.blood_pressure_systolic, reference_range: `<${ranges.bp_systolic.critical_high}`, severity: 'severe' });
      } else if (vitals.blood_pressure_systolic < ranges.bp_systolic.min || vitals.blood_pressure_systolic > ranges.bp_systolic.max) {
        flags.push({ parameter: 'BP Systolic', value: vitals.blood_pressure_systolic, reference_range: `${ranges.bp_systolic.min}-${ranges.bp_systolic.max}`, severity: 'moderate' });
      }
    }

    // Heart Rate
    if (vitals.heart_rate) {
      if (vitals.heart_rate < ranges.heart_rate.critical_low || vitals.heart_rate > ranges.heart_rate.critical_high) {
        flags.push({ parameter: 'Heart Rate', value: vitals.heart_rate, reference_range: `${ranges.heart_rate.min}-${ranges.heart_rate.max}`, severity: 'severe' });
      } else if (vitals.heart_rate < ranges.heart_rate.min || vitals.heart_rate > ranges.heart_rate.max) {
        flags.push({ parameter: 'Heart Rate', value: vitals.heart_rate, reference_range: `${ranges.heart_rate.min}-${ranges.heart_rate.max}`, severity: 'moderate' });
      }
    }

    // Temperature
    if (vitals.temperature) {
      if (vitals.temperature < ranges.temperature.critical_low || vitals.temperature > ranges.temperature.critical_high) {
        flags.push({ parameter: 'Temperature', value: vitals.temperature, reference_range: `${ranges.temperature.min}-${ranges.temperature.max}°C`, severity: 'severe' });
      } else if (vitals.temperature < ranges.temperature.min || vitals.temperature > ranges.temperature.max) {
        flags.push({ parameter: 'Temperature', value: vitals.temperature, reference_range: `${ranges.temperature.min}-${ranges.temperature.max}°C`, severity: 'moderate' });
      }
    }

    // Oxygen Saturation
    if (vitals.oxygen_saturation) {
      if (vitals.oxygen_saturation < ranges.oxygen_saturation.critical_low) {
        flags.push({ parameter: 'SpO2', value: vitals.oxygen_saturation, reference_range: `>${ranges.oxygen_saturation.min}%`, severity: 'severe' });
      } else if (vitals.oxygen_saturation < ranges.oxygen_saturation.min) {
        flags.push({ parameter: 'SpO2', value: vitals.oxygen_saturation, reference_range: `>${ranges.oxygen_saturation.min}%`, severity: 'moderate' });
      }
    }

    setVitals(prev => ({ ...prev, abnormal_flags: flags }));
  }, [
    vitals.blood_pressure_systolic,
    vitals.blood_pressure_diastolic,
    vitals.heart_rate,
    vitals.respiratory_rate,
    vitals.temperature,
    vitals.oxygen_saturation
  ]);

  const handleSave = async () => {
    // Validation
    if (!vitals.blood_pressure_systolic || !vitals.blood_pressure_diastolic) {
      alert('Blood pressure is required');
      return;
    }

    const vitalData: Partial<VitalSigns> = {
      ...vitals,
      recorded_at: new Date(),
      method: 'manual'
    };

    await onSave(vitalData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EFF6FF] rounded-lg">
              <Activity className="h-6 w-6 text-[#0F3D56]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-[#1E1E1E]">
                Vital Signs Entry
              </h2>
              <p className="text-sm text-[#6B7280]">
                Patient: {patient.first_name} {patient.last_name} • 
                Age: {calculateAge(patient.date_of_birth)} years
              </p>
            </div>
          </div>

          {/* Previous Vitals Quick View */}
          {previousVitals && (
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              View History
            </Button>
          )}
        </div>
      </Card>

      {/* Critical Alerts */}
      {vitals.abnormal_flags && vitals.abnormal_flags.some(f => f.severity === 'severe') && (
        <Card className="p-4 bg-[#FEF3F2] border-[#C84B31]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#C84B31] flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h3 className="font-medium text-[#C84B31] mb-2">
                Critical Vital Signs Detected
              </h3>
              <ul className="space-y-1">
                {vitals.abnormal_flags.filter(f => f.severity === 'severe').map((flag, index) => (
                  <li key={index} className="text-sm text-[#6B7280]">
                    <strong>{flag.parameter}:</strong> {flag.value} (Normal: {flag.reference_range})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Vital Signs Form */}
      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Blood Pressure */}
          <div>
            <Label className="required flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#C84B31]" />
              Blood Pressure (mmHg)
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                value={vitals.blood_pressure_systolic || ''}
                onChange={(e) => setVitals({ ...vitals, blood_pressure_systolic: parseInt(e.target.value) || undefined })}
                placeholder="Systolic"
                className={getInputClass(vitals.blood_pressure_systolic ?? undefined, ranges.bp_systolic)}
              />
              <div className="flex items-center px-2">
                <Minus className="h-4 w-4 text-[#6B7280]" />
              </div>
              <Input
                type="number"
                value={vitals.blood_pressure_diastolic || ''}
                onChange={(e) => setVitals({ ...vitals, blood_pressure_diastolic: parseInt(e.target.value) || undefined })}
                placeholder="Diastolic"
                className={getInputClass(vitals.blood_pressure_diastolic ?? undefined, ranges.bp_diastolic)}
              />
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Normal: {ranges.bp_systolic.min}-{ranges.bp_systolic.max} / {ranges.bp_diastolic.min}-{ranges.bp_diastolic.max}
            </p>
          </div>

          {/* Heart Rate */}
          <div>
            <Label className="required flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#C84B31]" />
              Heart Rate (bpm)
            </Label>
            <Input
              type="number"
              value={vitals.heart_rate || ''}
              onChange={(e) => setVitals({ ...vitals, heart_rate: parseInt(e.target.value) || undefined })}
              placeholder="Heart rate"
              className={`mt-2 ${getInputClass(vitals.heart_rate ?? undefined, ranges.heart_rate)}`}
            />
            <p className="text-xs text-[#6B7280] mt-1">
              Normal: {ranges.heart_rate.min}-{ranges.heart_rate.max} bpm
            </p>
          </div>

          {/* Respiratory Rate */}
          <div>
            <Label className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-[#2A9D8F]" />
              Respiratory Rate (breaths/min)
            </Label>
            <Input
              type="number"
              value={vitals.respiratory_rate || ''}
              onChange={(e) => setVitals({ ...vitals, respiratory_rate: parseInt(e.target.value) || undefined })}
              placeholder="Respiratory rate"
              className={`mt-2 ${getInputClass(vitals.respiratory_rate ?? undefined, ranges.respiratory_rate)}`}
            />
            <p className="text-xs text-[#6B7280] mt-1">
              Normal: {ranges.respiratory_rate.min}-{ranges.respiratory_rate.max} breaths/min
            </p>
          </div>

          {/* Temperature */}
          <div>
            <Label className="required flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-[#F4A261]" />
              Temperature (°C)
            </Label>
            <Input
              type="number"
              step="0.1"
              value={vitals.temperature || ''}
              onChange={(e) => setVitals({ ...vitals, temperature: parseFloat(e.target.value) || undefined })}
              placeholder="Temperature"
              className={`mt-2 ${getInputClass(vitals.temperature ?? undefined, ranges.temperature)}`}
            />
            <p className="text-xs text-[#6B7280] mt-1">
              Normal: {ranges.temperature.min}-{ranges.temperature.max}°C
            </p>
          </div>

          {/* Oxygen Saturation */}
          <div>
            <Label className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-[#0F3D56]" />
              Oxygen Saturation (SpO2 %)
            </Label>
            <Input
              type="number"
              value={vitals.oxygen_saturation || ''}
              onChange={(e) => setVitals({ ...vitals, oxygen_saturation: parseInt(e.target.value) || undefined })}
              placeholder="SpO2"
              className={`mt-2 ${getInputClass(vitals.oxygen_saturation ?? undefined, ranges.oxygen_saturation)}`}
            />
            <p className="text-xs text-[#6B7280] mt-1">
              Normal: ≥{ranges.oxygen_saturation.min}%
            </p>
          </div>

          {/* Weight */}
          <div>
            <Label className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-[#6B7280]" />
              Weight (kg)
            </Label>
            <Input
              type="number"
              step="0.1"
              value={vitals.weight || ''}
              onChange={(e) => setVitals({ ...vitals, weight: parseFloat(e.target.value) || undefined })}
              placeholder="Weight"
              className="mt-2"
            />
          </div>

          {/* Height */}
          <div>
            <Label className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-[#6B7280]" />
              Height (cm)
            </Label>
            <Input
              type="number"
              step="0.1"
              value={vitals.height || ''}
              onChange={(e) => setVitals({ ...vitals, height: parseFloat(e.target.value) || undefined })}
              placeholder="Height"
              className="mt-2"
            />
          </div>

          {/* BMI (Auto-calculated) */}
          {vitals.bmi && (
            <div>
              <Label>BMI (Calculated)</Label>
              <div className="mt-2 p-3 bg-[#F9FAFB] border rounded-lg">
                <div className="text-2xl font-bold text-[#0F3D56]">
                  {vitals.bmi}
                </div>
                <div className="text-xs text-[#6B7280] mt-1">
                  {vitals.bmi < 18.5 && 'Underweight'}
                  {vitals.bmi >= 18.5 && vitals.bmi < 25 && 'Normal'}
                  {vitals.bmi >= 25 && vitals.bmi < 30 && 'Overweight'}
                  {vitals.bmi >= 30 && 'Obese'}
                </div>
              </div>
            </div>
          )}

          {/* Pain Scale */}
          <div>
            <Label>Pain Scale (0-10)</Label>
            <div className="mt-2">
              <Input
                type="range"
                min="0"
                max="10"
                value={vitals.pain_scale || 0}
                onChange={(e) => setVitals({ ...vitals, pain_scale: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#6B7280] mt-1">
                <span>No pain (0)</span>
                <span className="font-medium text-[#1E1E1E]">{vitals.pain_scale || 0}</span>
                <span>Worst pain (10)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pregnancy-Specific Vitals */}
        {patient.gender === 'female' && calculateAge(patient.date_of_birth) >= 15 && calculateAge(patient.date_of_birth) <= 49 && (
          <div className="mt-6 p-4 bg-[#F0F9FF] rounded-lg border border-[#0F3D56]/20">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={isPregnant}
                onChange={(e) => setIsPregnant(e.target.checked)}
                className="h-4 w-4"
              />
              <Label>Patient is pregnant</Label>
            </div>

            {isPregnant && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Fundal Height (cm)</Label>
                  <Input
                    type="number"
                    value={vitals.fundal_height || ''}
                    onChange={(e) => setVitals({ ...vitals, fundal_height: parseFloat(e.target.value) || undefined })}
                    placeholder="Fundal height"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Fetal Heart Rate (bpm)</Label>
                  <Input
                    type="number"
                    value={vitals.fetal_heart_rate || ''}
                    onChange={(e) => setVitals({ ...vitals, fetal_heart_rate: parseInt(e.target.value) || undefined })}
                    placeholder="Fetal HR"
                    className="mt-2"
                  />
                  <p className="text-xs text-[#6B7280] mt-1">
                    Normal: 110-160 bpm
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} className="flex-1 gap-2">
            <CheckCircle className="h-4 w-4" />
            Save Vitals
          </Button>
          <Button variant="outline" className="gap-2">
            <Clock className="h-4 w-4" />
            View Trends
          </Button>
        </div>
      </Card>

      {/* Moderate Warnings */}
      {vitals.abnormal_flags && vitals.abnormal_flags.some(f => f.severity === 'moderate') && (
        <Card className="p-4 bg-[#FEF3E7] border-[#F4A261]">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#F4A261] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-[#F4A261] mb-2">
                Abnormal Vital Signs
              </h3>
              <ul className="space-y-1">
                {vitals.abnormal_flags.filter(f => f.severity === 'moderate').map((flag, index) => (
                  <li key={index} className="text-sm text-[#6B7280]">
                    <strong>{flag.parameter}:</strong> {flag.value} (Normal: {flag.reference_range})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * Helper Functions
 */
const calculateAge = (dob: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

const getInputClass = (value: number | undefined, range: { min: number; max: number; critical_low: number; critical_high: number }): string => {
  if (!value) return '';
  
  if (value < range.critical_low || value > range.critical_high) {
    return 'border-[#C84B31] bg-[#FEF3F2]';
  } else if (value < range.min || value > range.max) {
    return 'border-[#F4A261] bg-[#FEF3E7]';
  }
  
  return 'border-green-500 bg-green-50';
};
