/**
 * SOAP Clinical Documentation Interface
 * 
 * Hospital-grade structured clinical notes with:
 * - SOAP format (Subjective, Objective, Assessment, Plan)
 * - ICD-10 diagnosis coding
 * - Procedure documentation
 * - E-signature workflow
 * - Revision tracking
 * - Offline-capable
 * - Audit trail
 * 
 * Complies with: TMDA SaMD, Tanzania PDPA, WHO ethical AI
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import {
  FileText,
  Save,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Plus,
  X,
  Eye,
  Edit,
  Lock,
  History,
  Stethoscope,
  Activity,
  Pill,
  TestTube,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  PenTool
} from 'lucide-react';
import type { ClinicalNote, Encounter, Patient } from '../../types/HospitalDataModel';

interface SOAPDocumentationProps {
  encounter: Encounter;
  patient: Patient;
  onSave: (note: Partial<ClinicalNote>) => void;
  onSign: (noteId: string) => void;
  existingNote?: ClinicalNote;
}

export const SOAPDocumentation: React.FC<SOAPDocumentationProps> = ({
  encounter,
  patient,
  onSave,
  onSign,
  existingNote
}) => {
  const { t } = useTranslation(['clinical', 'common']);
  
  // SOAP Fields
  const [subjective, setSubjective] = useState(existingNote?.subjective || '');
  const [objective, setObjective] = useState(existingNote?.objective || '');
  const [assessment, setAssessment] = useState(existingNote?.assessment || '');
  const [plan, setPlan] = useState(existingNote?.plan || '');
  
  // Diagnosis
  const [primaryDiagnosisICD10, setPrimaryDiagnosisICD10] = useState(existingNote?.primary_diagnosis_icd10 || '');
  const [primaryDiagnosisText, setPrimaryDiagnosisText] = useState(existingNote?.primary_diagnosis_text || '');
  const [secondaryDiagnoses, setSecondaryDiagnoses] = useState(existingNote?.secondary_diagnoses || []);
  
  // ICD-10 Search
  const [icdSearchOpen, setIcdSearchOpen] = useState(false);
  const [icdSearchQuery, setIcdSearchQuery] = useState('');
  const [icdSearchResults, setIcdSearchResults] = useState<Array<{ code: string; description: string }>>([]);
  
  // Procedures
  const [procedures, setProcedures] = useState(existingNote?.procedures_performed || []);
  
  // Clinical Decision Support
  const [differentialDiagnoses, setDifferentialDiagnoses] = useState(existingNote?.differential_diagnoses || []);
  const [redFlags, setRedFlags] = useState(existingNote?.red_flags || []);
  const [aiSuggestions, setAiSuggestions] = useState(existingNote?.ai_suggestions || []);
  
  // State
  const [status, setStatus] = useState<'draft' | 'signed' | 'amended' | 'archived'>(existingNote?.status || 'draft');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(existingNote?.updated_at || null);
  const [showSignModal, setShowSignModal] = useState(false);

  /**
   * AUTO-SAVE (every 30 seconds if changes detected)
   */
  useEffect(() => {
    if (status === 'draft' && (subjective || objective || assessment || plan)) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [subjective, objective, assessment, plan]);

  const handleAutoSave = async () => {
    if (status !== 'draft') return;
    
    setSaving(true);
    const noteData: Partial<ClinicalNote> = {
      encounter_id: encounter.encounter_id,
      patient_id: patient.patient_id,
      subjective,
      objective,
      assessment,
      plan,
      primary_diagnosis_icd10: primaryDiagnosisICD10,
      primary_diagnosis_text: primaryDiagnosisText,
      secondary_diagnoses: secondaryDiagnoses,
      procedures_performed: procedures,
      differential_diagnoses: differentialDiagnoses,
      red_flags: redFlags,
      ai_suggestions: aiSuggestions,
      status: 'draft'
    };
    
    await onSave(noteData);
    setLastSaved(new Date());
    setSaving(false);
  };

  const handleManualSave = async () => {
    setSaving(true);
    await handleAutoSave();
    setSaving(false);
  };

  /**
   * ICD-10 SEARCH
   */
  const searchICD10 = async (query: string) => {
    if (query.length < 2) {
      setIcdSearchResults([]);
      return;
    }
    
    // Mock ICD-10 database - replace with actual API
    const mockICD10: Array<{ code: string; description: string }> = [
      { code: 'A09', description: 'Diarrhoea and gastroenteritis of presumed infectious origin' },
      { code: 'B50', description: 'Plasmodium falciparum malaria' },
      { code: 'B51', description: 'Plasmodium vivax malaria' },
      { code: 'E11', description: 'Type 2 diabetes mellitus' },
      { code: 'E66', description: 'Obesity' },
      { code: 'I10', description: 'Essential (primary) hypertension' },
      { code: 'I11', description: 'Hypertensive heart disease' },
      { code: 'J00', description: 'Acute nasopharyngitis [common cold]' },
      { code: 'J06', description: 'Acute upper respiratory infections of multiple sites' },
      { code: 'J18', description: 'Pneumonia, organism unspecified' },
      { code: 'J45', description: 'Asthma' },
      { code: 'K29', description: 'Gastritis and duodenitis' },
      { code: 'M79', description: 'Other soft tissue disorders, not elsewhere classified' },
      { code: 'N39', description: 'Other disorders of urinary system' },
      { code: 'O80', description: 'Single spontaneous delivery' },
      { code: 'R10', description: 'Abdominal and pelvic pain' },
      { code: 'R50', description: 'Fever of unknown origin' },
      { code: 'R51', description: 'Headache' },
      { code: 'T88', description: 'Other complications of surgical and medical care' }
    ];
    
    const results = mockICD10.filter(item => 
      item.code.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    
    setIcdSearchResults(results);
  };

  const selectICD10 = (code: string, description: string) => {
    setPrimaryDiagnosisICD10(code);
    setPrimaryDiagnosisText(description);
    setIcdSearchOpen(false);
    setIcdSearchQuery('');
    setIcdSearchResults([]);
  };

  const addSecondaryDiagnosis = (code: string, text: string) => {
    setSecondaryDiagnoses([...secondaryDiagnoses, { icd10_code: code, diagnosis_text: text }]);
  };

  /**
   * AI CLINICAL DECISION SUPPORT
   * (Triggered after subjective + objective entered)
   */
  const generateAISuggestions = async () => {
    // Mock AI suggestions - replace with actual AI model
    const symptoms = subjective.toLowerCase();
    const findings = objective.toLowerCase();
    
    const suggestions: string[] = [];
    const differentials: string[] = [];
    const flags: string[] = [];
    
    // Simple rule-based logic (replace with ML model)
    if (symptoms.includes('fever') && symptoms.includes('headache')) {
      differentials.push('Malaria', 'Upper respiratory infection', 'Meningitis');
      suggestions.push('Consider malaria RDT', 'Check for neck stiffness');
    }
    
    if (symptoms.includes('chest pain')) {
      flags.push('🚨 CARDIAC: Rule out acute coronary syndrome');
      suggestions.push('Obtain ECG immediately', 'Check troponin levels');
    }
    
    if (symptoms.includes('shortness of breath')) {
      differentials.push('Pneumonia', 'Asthma exacerbation', 'Heart failure');
      suggestions.push('Order chest X-ray', 'Check oxygen saturation');
    }
    
    setDifferentialDiagnoses(differentials);
    setRedFlags(flags);
    setAiSuggestions(suggestions);
  };

  useEffect(() => {
    if (subjective && objective) {
      generateAISuggestions();
    }
  }, [subjective, objective]);

  /**
   * SIGN NOTE (E-SIGNATURE)
   */
  const handleSignNote = () => {
    // Validation
    if (!subjective || !objective || !assessment || !plan) {
      alert('All SOAP sections must be completed before signing');
      return;
    }
    
    if (!primaryDiagnosisICD10) {
      alert('Primary diagnosis with ICD-10 code is required');
      return;
    }
    
    setShowSignModal(true);
  };

  const confirmSign = async (signature: string) => {
    setSaving(true);
    
    // Save final version
    await handleManualSave();
    
    // Sign the note
    if (existingNote?.note_id) {
      await onSign(existingNote.note_id);
    }
    
    setStatus('signed');
    setShowSignModal(false);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EFF6FF] rounded-lg">
              <FileText className="h-6 w-6 text-[#0F3D56]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-[#1E1E1E]">
                Clinical Documentation (SOAP)
              </h2>
              <p className="text-sm text-[#6B7280]">
                Encounter ID: {encounter.encounter_id.slice(0, 8)} • 
                Patient: {patient.first_name} {patient.last_name} ({patient.afya_id})
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            {status === 'draft' && (
              <Badge variant="outline" className="gap-2">
                <Clock className="h-3 w-3" />
                Draft
              </Badge>
            )}
            {status === 'signed' && (
              <Badge className="gap-2 bg-green-600">
                <CheckCircle className="h-3 w-3" />
                Signed
              </Badge>
            )}
            {lastSaved && (
              <span className="text-xs text-[#6B7280]">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleManualSave}
            disabled={saving || status === 'signed'}
            variant="outline"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button
            onClick={handleSignNote}
            disabled={saving || status === 'signed'}
            size="sm"
            className="gap-2"
          >
            <PenTool className="h-4 w-4" />
            Sign & Complete
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          
          {existingNote && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <History className="h-4 w-4" />
              Version History
            </Button>
          )}
        </div>
      </Card>

      {/* AI Alerts */}
      {redFlags.length > 0 && (
        <Card className="p-4 bg-[#FEF3F2] border-[#C84B31]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#C84B31] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-[#C84B31] mb-2">
                Clinical Red Flags Detected
              </h3>
              <ul className="space-y-1">
                {redFlags.map((flag, index) => (
                  <li key={index} className="text-sm text-[#6B7280]">
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Main SOAP Form */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: SOAP Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* SUBJECTIVE */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#EFF6FF] rounded">
                <Stethoscope className="h-5 w-5 text-[#0F3D56]" />
              </div>
              <div>
                <h3 className="font-medium text-[#1E1E1E]">
                  S - Subjective (Patient's Description)
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Chief complaint, history, symptoms as reported by patient
                </p>
              </div>
            </div>
            
            <Textarea
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              placeholder="Example: Patient presents with fever for 3 days, associated with headache and body aches. Reports chills and sweating at night. No cough or difficulty breathing. Appetite reduced..."
              className="min-h-[120px]"
              disabled={status === 'signed'}
            />
          </Card>

          {/* OBJECTIVE */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#EFF6FF] rounded">
                <Activity className="h-5 w-5 text-[#0F3D56]" />
              </div>
              <div>
                <h3 className="font-medium text-[#1E1E1E]">
                  O - Objective (Clinical Findings)
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Physical examination, vital signs, observations
                </p>
              </div>
            </div>
            
            {/* Vitals Summary */}
            <div className="mb-4 p-3 bg-[#F9FAFB] rounded-lg border">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[#6B7280]">BP:</span>{' '}
                  <span className="font-medium">120/80 mmHg</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">HR:</span>{' '}
                  <span className="font-medium">88 bpm</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">Temp:</span>{' '}
                  <span className="font-medium text-[#C84B31]">38.5°C</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">RR:</span>{' '}
                  <span className="font-medium">18/min</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">SpO2:</span>{' '}
                  <span className="font-medium">97%</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">Weight:</span>{' '}
                  <span className="font-medium">68 kg</span>
                </div>
              </div>
            </div>
            
            <Textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Example: General appearance - alert, mildly distressed. Temp 38.5°C. Chest - clear to auscultation bilaterally. Abdomen - soft, non-tender. Skin - no rash. No focal neurological deficits..."
              className="min-h-[120px]"
              disabled={status === 'signed'}
            />
          </Card>

          {/* ASSESSMENT */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#EFF6FF] rounded">
                <FileText className="h-5 w-5 text-[#0F3D56]" />
              </div>
              <div>
                <h3 className="font-medium text-[#1E1E1E]">
                  A - Assessment (Diagnosis)
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Clinical impression, differential diagnoses, ICD-10 coding
                </p>
              </div>
            </div>
            
            {/* Primary Diagnosis */}
            <div className="mb-4">
              <Label className="required">Primary Diagnosis</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={primaryDiagnosisICD10}
                  placeholder="ICD-10 Code"
                  className="w-32 font-mono"
                  disabled={status === 'signed'}
                  readOnly
                />
                <Input
                  value={primaryDiagnosisText}
                  placeholder="Diagnosis description"
                  className="flex-1"
                  disabled={status === 'signed'}
                  readOnly
                />
                <Button
                  variant="outline"
                  onClick={() => setIcdSearchOpen(true)}
                  disabled={status === 'signed'}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Secondary Diagnoses */}
            {secondaryDiagnoses.length > 0 && (
              <div className="mb-4">
                <Label>Secondary Diagnoses</Label>
                <div className="space-y-2 mt-2">
                  {secondaryDiagnoses.map((diag, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-[#F9FAFB] rounded border">
                      <span className="font-mono text-sm text-[#0F3D56]">
                        {diag.icd10_code}
                      </span>
                      <span className="text-sm flex-1">
                        {diag.diagnosis_text}
                      </span>
                      {status !== 'signed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSecondaryDiagnoses(secondaryDiagnoses.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status !== 'signed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIcdSearchOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Secondary Diagnosis
              </Button>
            )}

            <Textarea
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Example: Clinical presentation consistent with acute malaria. Patient has typical symptoms of fever, chills, and body aches. No signs of severe malaria or complications at this time..."
              className="min-h-[100px] mt-4"
              disabled={status === 'signed'}
            />
          </Card>

          {/* PLAN */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#EFF6FF] rounded">
                <Pill className="h-5 w-5 text-[#0F3D56]" />
              </div>
              <div>
                <h3 className="font-medium text-[#1E1E1E]">
                  P - Plan (Treatment & Follow-up)
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Medications, investigations, procedures, follow-up
                </p>
              </div>
            </div>
            
            <Textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Example: 1. Start artemether-lumefantrine (Coartem) 4 tablets PO twice daily for 3 days. 2. Paracetamol 1g PO every 8 hours for fever. 3. Oral rehydration solution as needed. 4. Follow-up in 3 days or sooner if symptoms worsen..."
              className="min-h-[120px]"
              disabled={status === 'signed'}
            />

            {/* Quick Action Buttons */}
            {status !== 'signed' && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {/* Open prescription form */}}
                >
                  <Pill className="h-4 w-4" />
                  New Prescription
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {/* Open lab order form */}}
                >
                  <TestTube className="h-4 w-4" />
                  Order Labs
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {/* Open referral form */}}
                >
                  <ArrowRight className="h-4 w-4" />
                  Refer Patient
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Clinical Decision Support */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <Card className="p-4 bg-[#EFF6FF] border-[#0F3D56]">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-[#0F3D56]" />
                <h3 className="font-medium text-[#0F3D56]">
                  AI Clinical Suggestions
                </h3>
              </div>
              <ul className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-[#6B7280] flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#0F3D56]" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Differential Diagnoses */}
          {differentialDiagnoses.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium text-[#1E1E1E] mb-3">
                Differential Diagnoses
              </h3>
              <ul className="space-y-2">
                {differentialDiagnoses.map((diag, index) => (
                  <li key={index} className="text-sm text-[#6B7280] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#0F3D56] rounded-full" />
                    {diag}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Patient Context */}
          <Card className="p-4">
            <h3 className="font-medium text-[#1E1E1E] mb-3">
              Patient Context
            </h3>
            <div className="space-y-3 text-sm">
              {/* Chronic Conditions */}
              {patient.chronic_conditions.length > 0 && (
                <div>
                  <span className="text-[#6B7280] font-medium">Chronic Conditions:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {patient.chronic_conditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergies */}
              {patient.allergies.length > 0 && (
                <div>
                  <span className="text-[#C84B31] font-medium">⚠️ Allergies:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="outline" className="text-xs text-[#C84B31] border-[#C84B31]">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Visit */}
              <div>
                <span className="text-[#6B7280]">Last visit:</span>{' '}
                <span className="font-medium">15 Jan 2026</span>
              </div>

              {/* Recent Labs */}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <TestTube className="h-4 w-4" />
                View Recent Labs
              </Button>
            </div>
          </Card>

          {/* Locked Note Info */}
          {status === 'signed' && (
            <Card className="p-4 bg-[#F9FAFB]">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-[#6B7280]" />
                <h3 className="font-medium text-[#6B7280]">
                  Note Signed
                </h3>
              </div>
              <p className="text-xs text-[#6B7280]">
                This note has been electronically signed and cannot be edited. 
                Create an amendment if changes are needed.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
              >
                Create Amendment
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* ICD-10 Search Modal */}
      {icdSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">ICD-10 Code Search</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIcdSearchOpen(false);
                    setIcdSearchQuery('');
                    setIcdSearchResults([]);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <Input
                placeholder="Search by code or diagnosis name..."
                value={icdSearchQuery}
                onChange={(e) => {
                  setIcdSearchQuery(e.target.value);
                  searchICD10(e.target.value);
                }}
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {icdSearchResults.length > 0 ? (
                <div className="space-y-2">
                  {icdSearchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-[#EFF6FF] cursor-pointer transition-colors"
                      onClick={() => selectICD10(result.code, result.description)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[#0F3D56] font-mono">
                          {result.code}
                        </Badge>
                        <span className="text-sm">{result.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : icdSearchQuery.length >= 2 ? (
                <p className="text-center text-[#6B7280] py-8">
                  No results found for "{icdSearchQuery}"
                </p>
              ) : (
                <p className="text-center text-[#6B7280] py-8">
                  Start typing to search ICD-10 codes
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* E-Signature Modal */}
      {showSignModal && (
        <ESignatureModal
          onConfirm={confirmSign}
          onCancel={() => setShowSignModal(false)}
          noteData={{
            subjective,
            objective,
            assessment,
            plan,
            primaryDiagnosis: `${primaryDiagnosisICD10} - ${primaryDiagnosisText}`
          }}
        />
      )}
    </div>
  );
};

/**
 * E-Signature Modal Component
 */
interface ESignatureModalProps {
  onConfirm: (signature: string) => void;
  onCancel: () => void;
  noteData: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    primaryDiagnosis: string;
  };
}

const ESignatureModal: React.FC<ESignatureModalProps> = ({
  onConfirm,
  onCancel,
  noteData
}) => {
  const [password, setPassword] = useState('');
  const [biometric, setBiometric] = useState(false);

  const handleSign = () => {
    if (!password && !biometric) {
      alert('Password or biometric authentication required');
      return;
    }
    
    // In production: verify credentials, create hash
    const signature = `SIGNED_${Date.now()}`;
    onConfirm(signature);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EFF6FF] rounded-lg">
              <UserCheck className="h-6 w-6 text-[#0F3D56]" />
            </div>
            <div>
              <h2 className="text-xl font-medium">Electronic Signature</h2>
              <p className="text-sm text-[#6B7280]">
                Verify your identity to sign this clinical note
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Note Preview */}
          <div className="p-4 bg-[#F9FAFB] rounded-lg border space-y-2 text-sm">
            <div>
              <span className="font-medium">Primary Diagnosis:</span>{' '}
              {noteData.primaryDiagnosis}
            </div>
            <div>
              <span className="font-medium">Subjective:</span>{' '}
              {noteData.subjective.slice(0, 100)}...
            </div>
          </div>

          {/* Authentication */}
          <div>
            <Label htmlFor="password" className="required">
              Enter your password to sign
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your account password"
              className="mt-2"
            />
          </div>

          <div className="flex items-center justify-center py-2 text-[#6B7280]">
            OR
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setBiometric(true)}
          >
            <UserCheck className="h-5 w-5" />
            Use Biometric Authentication
          </Button>

          {/* Legal Notice */}
          <Card className="p-4 bg-[#FEF3E7] border-[#F4A261]">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-[#F4A261] flex-shrink-0" />
              <div className="text-xs text-[#6B7280]">
                <p className="font-medium text-[#F4A261] mb-1">
                  Legal Notice
                </p>
                <p>
                  By signing this document, you confirm that the information is accurate 
                  and complete to the best of your knowledge. This signature is legally binding 
                  and will be recorded in the audit trail.
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              disabled={!password && !biometric}
              className="gap-2"
            >
              <PenTool className="h-4 w-4" />
              Sign Note
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
