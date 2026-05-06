/**
 * Master Patient Index (MPI) System
 * 
 * Cross-facility patient identity management with duplicate detection
 * 
 * Features:
 * - Fuzzy matching algorithm for duplicate detection
 * - Merge workflow with audit trail
 * - Cross-facility patient search
 * - Consent-based data sharing
 * - Offline-safe temporary ID assignment
 * - Conflict resolution on sync
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  AlertCircle,
  Search,
  Users,
  CheckCircle,
  X,
  AlertTriangle,
  Merge,
  Eye,
  Shield,
  Calendar,
  Phone,
  MapPin,
  FileText,
  ArrowRight
} from 'lucide-react';
import type { Patient, MasterPatientIndex } from '../../types/HospitalDataModel';

interface MPISystemProps {
  facilityId: string;
  onPatientSelected: (patient: Patient) => void;
}

export const MPISystem: React.FC<MPISystemProps> = ({ facilityId, onPatientSelected }) => {
  const { t } = useTranslation(['common', 'clinical']);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [duplicates, setDuplicates] = useState<Array<{ patient: Patient; score: number }>>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * FUZZY MATCHING ALGORITHM
   * Detects potential duplicates based on:
   * - Name similarity (Levenshtein distance)
   * - DOB match
   * - Phone number match
   * - National ID match
   */
  const calculateDuplicateScore = (patient1: Patient, patient2: Patient): number => {
    let score = 0;
    
    // National ID match (100% confident)
    if (patient1.national_id && patient2.national_id && 
        patient1.national_id === patient2.national_id) {
      return 100;
    }
    
    // Phone match (80% weight)
    if (patient1.phone_primary === patient2.phone_primary) {
      score += 80;
    }
    
    // DOB match (15% weight)
    if (patient1.date_of_birth.getTime() === patient2.date_of_birth.getTime()) {
      score += 15;
    }
    
    // Name similarity (5% weight)
    const nameSimilarity = calculateNameSimilarity(
      `${patient1.first_name} ${patient1.last_name}`,
      `${patient2.first_name} ${patient2.last_name}`
    );
    score += nameSimilarity * 5;
    
    return Math.min(score, 100);
  };

  const calculateNameSimilarity = (name1: string, name2: string): number => {
    // Simple Levenshtein distance implementation
    name1 = name1.toLowerCase().trim();
    name2 = name2.toLowerCase().trim();
    
    if (name1 === name2) return 1;
    
    const maxLength = Math.max(name1.length, name2.length);
    const distance = levenshteinDistance(name1, name2);
    return 1 - (distance / maxLength);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  /**
   * SEARCH PATIENTS ACROSS FACILITIES
   */
  const searchPatients = async (query: string) => {
    setLoading(true);
    
    // In production, this would be an API call
    // Simulating search with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - replace with actual API
    const mockResults: Patient[] = [
      {
        patient_id: 'pat-001',
        mpi_id: 'mpi-12345',
        national_id: '19850615-12345-67890-12',
        afya_id: 'AFY-001-2024',
        first_name: 'John',
        middle_name: 'Peter',
        last_name: 'Mwangi',
        date_of_birth: new Date('1985-06-15'),
        estimated_dob: false,
        gender: 'male',
        phone_primary: '+255712345678',
        phone_secondary: null,
        email: null,
        region: 'Dar es Salaam',
        district: 'Kinondoni',
        ward: 'Tandale',
        village: null,
        street_address: null,
        blood_type: 'A+',
        allergies: ['Penicillin'],
        chronic_conditions: ['E11'],
        primary_facility_id: facilityId,
        registered_facility_id: facilityId,
        consent_data_sharing: true,
        consent_research: false,
        consent_sms: true,
        status: 'active',
        merged_into_patient_id: null,
        deceased_date: null,
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-02-20'),
        created_by_user_id: 'user-001',
        updated_by_user_id: 'user-001'
      }
    ];
    
    setSearchResults(mockResults);
    
    // Check for duplicates
    const potentialDuplicates = mockResults
      .map(patient => ({
        patient,
        score: calculateDuplicateScore(mockResults[0], patient)
      }))
      .filter(({ score }) => score > 60 && score < 100);
    
    setDuplicates(potentialDuplicates);
    setLoading(false);
  };

  /**
   * MERGE PATIENTS
   */
  const mergePatients = async (keepPatientId: string, mergePatientId: string, reason: string) => {
    setLoading(true);
    
    // In production: API call to backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create audit trail entry
    
    setLoading(false);
    setShowMergeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#EFF6FF] rounded-lg">
            <Users className="h-6 w-6 text-[#0F3D56]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-[#1E1E1E]">
              Patient Search (MPI)
            </h2>
            <p className="text-sm text-[#6B7280]">
              Search across all facilities with duplicate detection
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by name, phone, AfyaID, or National ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchPatients(searchQuery);
                  }
                }}
                className="h-12"
              />
            </div>
            <Button
              onClick={() => searchPatients(searchQuery)}
              disabled={loading || !searchQuery}
              className="h-12 px-6"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              This Facility Only
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              District
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              Region
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              National
            </Badge>
          </div>
        </div>
      </Card>

      {/* Duplicate Alert */}
      {duplicates.length > 0 && (
        <Card className="p-4 bg-[#FEF3E7] border-[#F4A261]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#F4A261] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-[#F4A261] mb-1">
                Potential Duplicates Detected
              </h3>
              <p className="text-sm text-[#6B7280] mb-3">
                {duplicates.length} potential duplicate record{duplicates.length !== 1 ? 's' : ''} found. 
                Review before creating new patient.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMergeModal(true)}
                className="gap-2"
              >
                <Merge className="h-4 w-4" />
                Review Duplicates
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#6B7280]">
            {searchResults.length} patient{searchResults.length !== 1 ? 's' : ''} found
          </h3>
          
          {searchResults.map((patient) => (
            <Card
              key={patient.patient_id}
              className="p-4 hover:border-[#0F3D56] cursor-pointer transition-colors"
              onClick={() => {
                setSelectedPatient(patient);
                onPatientSelected(patient);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Patient Name & ID */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-[#1E1E1E]">
                      {patient.first_name} {patient.middle_name} {patient.last_name}
                    </h3>
                    <Badge variant="outline" className="font-mono text-xs">
                      {patient.afya_id}
                    </Badge>
                    {patient.mpi_id && (
                      <Badge className="bg-[#0F3D56] text-white text-xs">
                        MPI: {patient.mpi_id.slice(0, 8)}
                      </Badge>
                    )}
                  </div>

                  {/* Patient Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(patient.date_of_birth).toLocaleDateString()} 
                        ({calculateAge(patient.date_of_birth)} years)
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Phone className="h-4 w-4" />
                      <span>{patient.phone_primary}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <MapPin className="h-4 w-4" />
                      <span>{patient.district}, {patient.region}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <FileText className="h-4 w-4" />
                      <span className="capitalize">{patient.gender}</span>
                    </div>
                  </div>

                  {/* Chronic Conditions & Allergies */}
                  {(patient.chronic_conditions.length > 0 || patient.allergies.length > 0) && (
                    <div className="flex gap-2 mt-3">
                      {patient.chronic_conditions.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {patient.chronic_conditions.length} condition{patient.chronic_conditions.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {patient.allergies.length > 0 && (
                        <Badge variant="outline" className="text-xs text-[#C84B31]">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {patient.allergies.length} allerg{patient.allergies.length !== 1 ? 'ies' : 'y'}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Consent Status */}
                  <div className="flex gap-2 mt-2">
                    {patient.consent_data_sharing && (
                      <Badge variant="outline" className="text-xs bg-green-50">
                        <Shield className="h-3 w-3 mr-1 text-green-600" />
                        <span className="text-green-700">Data Sharing Consented</span>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchResults.length === 0 && searchQuery && !loading && (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-[#6B7280]" />
          <h3 className="text-lg font-medium text-[#1E1E1E] mb-2">
            No patients found
          </h3>
          <p className="text-sm text-[#6B7280] mb-4">
            No patients match your search criteria
          </p>
          <Button onClick={() => {/* Open registration form */}}>
            Register New Patient
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#0F3D56] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-[#6B7280]">Searching patients...</p>
        </Card>
      )}
    </div>
  );
};

/**
 * Calculate age from date of birth
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

/**
 * Patient Merge Modal Component
 */
interface MergeModalProps {
  patient1: Patient;
  patient2: Patient;
  duplicateScore: number;
  onMerge: (keepPatientId: string, mergePatientId: string, reason: string) => void;
  onClose: () => void;
}

export const PatientMergeModal: React.FC<MergeModalProps> = ({
  patient1,
  patient2,
  duplicateScore,
  onMerge,
  onClose
}) => {
  const [selectedKeep, setSelectedKeep] = useState<string>(patient1.patient_id);
  const [mergeReason, setMergeReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FEF3E7] rounded-lg">
                <Merge className="h-6 w-6 text-[#F4A261]" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-[#1E1E1E]">
                  Merge Duplicate Patients
                </h2>
                <p className="text-sm text-[#6B7280]">
                  Similarity score: {duplicateScore}%
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Patient 1 */}
            <Card
              className={`p-4 cursor-pointer transition-all ${
                selectedKeep === patient1.patient_id 
                  ? 'border-2 border-[#0F3D56] bg-[#EFF6FF]' 
                  : 'border'
              }`}
              onClick={() => setSelectedKeep(patient1.patient_id)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-medium text-[#1E1E1E]">Patient Record 1</h3>
                {selectedKeep === patient1.patient_id && (
                  <Badge className="bg-[#0F3D56]">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Keep This
                  </Badge>
                )}
              </div>
              {/* Patient details */}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-[#6B7280]">Name:</span>{' '}
                  <span className="font-medium">{patient1.first_name} {patient1.last_name}</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">AfyaID:</span>{' '}
                  <span className="font-mono">{patient1.afya_id}</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">Phone:</span>{' '}
                  <span>{patient1.phone_primary}</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">Created:</span>{' '}
                  <span>{patient1.created_at.toLocaleDateString()}</span>
                </div>
              </div>
            </Card>

            {/* Patient 2 */}
            <Card
              className={`p-4 cursor-pointer transition-all ${
                selectedKeep === patient2.patient_id 
                  ? 'border-2 border-[#0F3D56] bg-[#EFF6FF]' 
                  : 'border'
              }`}
              onClick={() => setSelectedKeep(patient2.patient_id)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-medium text-[#1E1E1E]">Patient Record 2</h3>
                {selectedKeep === patient2.patient_id && (
                  <Badge className="bg-[#0F3D56]">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Keep This
                  </Badge>
                )}
              </div>
              {/* Patient details */}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-[#6B7280]">Name:</span>{' '}
                  <span className="font-medium">{patient2.first_name} {patient2.last_name}</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">AfyaID:</span>{' '}
                  <span className="font-mono">{patient2.afya_id}</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">Phone:</span>{' '}
                  <span>{patient2.phone_primary}</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">Created:</span>{' '}
                  <span>{patient2.created_at.toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Merge Reason */}
          <div className="mb-6">
            <Label htmlFor="merge-reason" className="required">
              Reason for Merge
            </Label>
            <Input
              id="merge-reason"
              placeholder="Explain why these records should be merged..."
              value={mergeReason}
              onChange={(e) => setMergeReason(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Warning */}
          <Card className="p-4 bg-[#FEF3F2] border-[#FCA5A5] mb-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-[#C84B31] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[#C84B31] mb-1">
                  Warning: This action cannot be undone
                </h4>
                <p className="text-sm text-[#6B7280]">
                  The merged patient record will be archived and all encounters will be linked to the kept record.
                  This action will be logged in the audit trail.
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const keepId = selectedKeep;
                const mergeId = selectedKeep === patient1.patient_id ? patient2.patient_id : patient1.patient_id;
                onMerge(keepId, mergeId, mergeReason);
              }}
              disabled={!mergeReason}
              className="gap-2"
            >
              <Merge className="h-4 w-4" />
              Merge Patients
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
