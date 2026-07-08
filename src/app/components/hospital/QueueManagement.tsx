/**
 * Hospital Queue Management System
 * 
 * Multi-department queue with:
 * - Priority-based triage (1-5 scale)
 * - Real-time wait time estimation
 * - Provider assignment & load balancing
 * - Department-specific queues (OPD, Emergency, Antenatal, etc.)
 * - Walk-in + scheduled patient merge
 * - Queue display for TV monitors
 * - Role-based queue visibility
 * - Emergency override capability
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Users,
  Clock,
  AlertCircle,
  Activity,
  ArrowRight,
  User,
  Phone,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  X,
  Pause,
  Play,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import type { QueueEntry, Patient, Encounter } from '../../types/HospitalDataModel';

interface QueueManagementProps {
  facilityId: string;
  department?: string;
  userRole: 'receptionist' | 'nurse' | 'doctor' | 'admin' | 'clinical-officer' | 'pharmacist' | 'lab-tech' | 'moh-admin';
}

export const QueueManagement: React.FC<QueueManagementProps> = ({
  facilityId,
  department,
  userRole
}) => {
  const { t } = useTranslation(['clinical', 'common']);
  
  const [queueEntries, setQueueEntries] = useState<Array<QueueEntry & { patient: Patient; encounter: Encounter }>>([]);
  const [selectedDepartment, setSelectedDepartment] = useState(department || 'OPD');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('waiting');
  const [loading, setLoading] = useState(false);

  // Departments
  const departments = [
    { id: 'OPD', name: 'Outpatient (OPD)', icon: Users },
    { id: 'Emergency', name: 'Emergency', icon: AlertCircle },
    { id: 'Antenatal', name: 'Antenatal Care', icon: Activity },
    { id: 'Pediatrics', name: 'Pediatrics', icon: Users },
    { id: 'Dental', name: 'Dental', icon: Users },
    { id: 'Pharmacy', name: 'Pharmacy', icon: Users },
    { id: 'Laboratory', name: 'Laboratory', icon: Activity }
  ];

  /**
   * LOAD QUEUE DATA
   */
  useEffect(() => {
    loadQueue();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, [selectedDepartment, facilityId]);

  const loadQueue = async () => {
    setLoading(true);
    
    // Mock data - replace with API call
    const mockQueue: Array<QueueEntry & { patient: Patient; encounter: Encounter }> = [
      {
        queue_id: 'q-001',
        patient_id: 'pat-001',
        encounter_id: 'enc-001',
        facility_id: facilityId,
        department: 'OPD',
        queue_number: 1,
        arrival_time: new Date(Date.now() - 45 * 60000), // 45 min ago
        triage_priority: 1,
        assigned_to_user_id: 'user-doctor-001',
        assigned_at: new Date(),
        status: 'in-consultation',
        called_at: new Date(Date.now() - 15 * 60000),
        consultation_started_at: new Date(Date.now() - 10 * 60000),
        completed_at: null,
        estimated_wait_minutes: 15,
        created_at: new Date(),
        updated_at: new Date(),
        patient: {
          patient_id: 'pat-001',
          mpi_id: 'mpi-001',
          national_id: '19850615-12345-67890-12',
          afya_id: 'AFY-001-2024',
          first_name: 'Emmanuel',
          middle_name: 'John',
          last_name: 'Kileo',
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
          allergies: [],
          chronic_conditions: [],
          primary_facility_id: facilityId,
          registered_facility_id: facilityId,
          consent_data_sharing: true,
          consent_research: false,
          consent_sms: true,
          status: 'active',
          merged_into_patient_id: null,
          deceased_date: null,
          created_at: new Date(),
          updated_at: new Date(),
          created_by_user_id: 'user-001',
          updated_by_user_id: 'user-001'
        },
        encounter: {
          encounter_id: 'enc-001',
          patient_id: 'pat-001',
          mpi_id: 'mpi-001',
          facility_id: facilityId,
          department: 'OPD',
          provider_id: 'user-doctor-001',
          encounter_type: 'outpatient',
          status: 'in-progress',
          priority: 'emergency',
          chief_complaint: 'Severe chest pain',
          presenting_symptoms: ['chest pain', 'shortness of breath'],
          triage_category: 1,
          triage_by_user_id: 'user-nurse-001',
          triage_timestamp: new Date(),
          ai_triage_score: 95,
          scheduled_at: null,
          checked_in_at: new Date(),
          consultation_started_at: new Date(),
          consultation_ended_at: null,
          referred_from_facility_id: null,
          referred_to_facility_id: null,
          referral_reason: null,
          disposition: null as any,
          follow_up_date: null,
          created_at: new Date(),
          updated_at: new Date(),
          created_by_user_id: 'user-001'
        }
      },
      {
        queue_id: 'q-002',
        patient_id: 'pat-002',
        encounter_id: 'enc-002',
        facility_id: facilityId,
        department: 'OPD',
        queue_number: 2,
        arrival_time: new Date(Date.now() - 30 * 60000),
        triage_priority: 3,
        assigned_to_user_id: null,
        assigned_at: null,
        status: 'waiting',
        called_at: null,
        consultation_started_at: null,
        completed_at: null,
        estimated_wait_minutes: 25,
        created_at: new Date(),
        updated_at: new Date(),
        patient: {
          patient_id: 'pat-002',
          mpi_id: 'mpi-002',
          national_id: null,
          afya_id: 'AFY-002-2024',
          first_name: 'Amina',
          middle_name: 'Hassan',
          last_name: 'Said',
          date_of_birth: new Date('1992-03-20'),
          estimated_dob: false,
          gender: 'female',
          phone_primary: '+255754123456',
          phone_secondary: null,
          email: null,
          region: 'Dar es Salaam',
          district: 'Ilala',
          ward: 'Buguruni',
          village: null,
          street_address: null,
          blood_type: null,
          allergies: ['Penicillin'],
          chronic_conditions: ['E11'],
          primary_facility_id: facilityId,
          registered_facility_id: facilityId,
          consent_data_sharing: true,
          consent_research: true,
          consent_sms: true,
          status: 'active',
          merged_into_patient_id: null,
          deceased_date: null,
          created_at: new Date(),
          updated_at: new Date(),
          created_by_user_id: 'user-001',
          updated_by_user_id: 'user-001'
        },
        encounter: {
          encounter_id: 'enc-002',
          patient_id: 'pat-002',
          mpi_id: 'mpi-002',
          facility_id: facilityId,
          department: 'OPD',
          provider_id: null as any,
          encounter_type: 'outpatient',
          status: 'checked-in',
          priority: 'routine',
          chief_complaint: 'Fever for 3 days',
          presenting_symptoms: ['fever', 'headache', 'body aches'],
          triage_category: 3,
          triage_by_user_id: 'user-nurse-001',
          triage_timestamp: new Date(),
          ai_triage_score: 45,
          scheduled_at: null,
          checked_in_at: new Date(),
          consultation_started_at: null,
          consultation_ended_at: null,
          referred_from_facility_id: null,
          referred_to_facility_id: null,
          referral_reason: null,
          disposition: null as any,
          follow_up_date: null,
          created_at: new Date(),
          updated_at: new Date(),
          created_by_user_id: 'user-001'
        }
      }
    ];

    // Filter by department
    const filtered = mockQueue.filter(q => q.department === selectedDepartment);
    setQueueEntries(filtered);
    setLoading(false);
  };

  /**
   * CALCULATE WAIT TIME
   */
  const calculateWaitTime = (arrivalTime: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - arrivalTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  /**
   * PRIORITY COLORS
   */
  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return 'bg-[#C84B31] text-white'; // Emergency - Red
      case 2: return 'bg-[#F4A261] text-white'; // Urgent - Orange
      case 3: return 'bg-[#E9C46A] text-black'; // Semi-urgent - Yellow
      case 4: return 'bg-[#2A9D8F] text-white'; // Less urgent - Green
      case 5: return 'bg-[#6B7280] text-white'; // Non-urgent - Gray
      default: return 'bg-gray-300';
    }
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'P1 - Immediate';
      case 2: return 'P2 - Urgent';
      case 3: return 'P3 - Semi-urgent';
      case 4: return 'P4 - Less urgent';
      case 5: return 'P5 - Non-urgent';
      default: return 'Unknown';
    }
  };

  /**
   * QUEUE ACTIONS
   */
  const callNextPatient = async (queueEntry: QueueEntry) => {
    // API call to update status
    loadQueue();
  };

  const assignProvider = async (queueId: string, providerId: string) => {
    // API call to assign
    loadQueue();
  };

  const pauseQueue = async (queueId: string) => {
    // API call to pause
    loadQueue();
  };

  const markNoShow = async (queueId: string) => {
    // API call to mark no-show
    loadQueue();
  };

  /**
   * FILTERED QUEUE
   */
  const filteredQueue = queueEntries
    .filter(q => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          q.patient.first_name.toLowerCase().includes(query) ||
          q.patient.last_name.toLowerCase().includes(query) ||
          q.patient.afya_id.toLowerCase().includes(query) ||
          q.patient.phone_primary.includes(query)
        );
      }
      return true;
    })
    .filter(q => {
      // Priority filter
      if (filterPriority !== 'all') {
        return q.triage_priority === filterPriority;
      }
      return true;
    })
    .filter(q => {
      // Status filter
      if (filterStatus !== 'all') {
        return q.status === filterStatus;
      }
      return true;
    });

  /**
   * STATISTICS
   */
  const stats = {
    total: queueEntries.length,
    waiting: queueEntries.filter(q => q.status === 'waiting').length,
    inConsultation: queueEntries.filter(q => q.status === 'in-consultation').length,
    emergency: queueEntries.filter(q => q.triage_priority === 1).length,
    avgWaitTime: queueEntries.reduce((sum, q) => sum + (q.estimated_wait_minutes || 0), 0) / queueEntries.length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EFF6FF] rounded-lg">
              <Users className="h-6 w-6 text-[#0F3D56]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-[#1E1E1E]">
                Queue Management
              </h2>
              <p className="text-sm text-[#6B7280]">
                {selectedDepartment} Department • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0F3D56]">
                {stats.total}
              </div>
              <div className="text-xs text-[#6B7280]">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#E9C46A]">
                {stats.waiting}
              </div>
              <div className="text-xs text-[#6B7280]">Waiting</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#2A9D8F]">
                {stats.inConsultation}
              </div>
              <div className="text-xs text-[#6B7280]">In Room</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#C84B31]">
                {stats.emergency}
              </div>
              <div className="text-xs text-[#6B7280]">Emergency</div>
            </div>
          </div>
        </div>

        {/* Department Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {departments.map((dept) => (
            <Button
              key={dept.id}
              variant={selectedDepartment === dept.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDepartment(dept.id)}
              className="gap-2 whitespace-nowrap"
            >
              <dept.icon className="h-4 w-4" />
              {dept.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <Input
                placeholder="Search by name, AfyaID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="1">P1 - Immediate</option>
            <option value="2">P2 - Urgent</option>
            <option value="3">P3 - Semi-urgent</option>
            <option value="4">P4 - Less urgent</option>
            <option value="5">P5 - Non-urgent</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="waiting">Waiting</option>
            <option value="in-consultation">In Consultation</option>
            <option value="completed">Completed</option>
          </select>

          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Emergency Alert Banner */}
      {stats.emergency > 0 && (
        <Card className="p-4 bg-[#FEF3F2] border-[#C84B31]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#C84B31] animate-pulse" />
            <div className="flex-1">
              <h3 className="font-medium text-[#C84B31]">
                {stats.emergency} Emergency Patient{stats.emergency !== 1 ? 's' : ''} in Queue
              </h3>
              <p className="text-sm text-[#6B7280]">
                Immediate attention required
              </p>
            </div>
            <Button size="sm" className="bg-[#C84B31] hover:bg-[#A03B24]">
              View Emergency Queue
            </Button>
          </div>
        </Card>
      )}

      {/* Queue Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#6B7280]">
                  Queue #
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#6B7280]">
                  Priority
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#6B7280]">
                  Patient
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#6B7280]">
                  Chief Complaint
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#6B7280]">
                  Wait Time
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#6B7280]">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#6B7280]">
                  Assigned To
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#6B7280]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map((entry) => (
                <tr
                  key={entry.queue_id}
                  className="border-b hover:bg-[#F9FAFB] transition-colors"
                >
                  {/* Queue Number */}
                  <td className="p-4">
                    <div className="text-2xl font-bold text-[#0F3D56]">
                      {entry.queue_number.toString().padStart(3, '0')}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="p-4">
                    <Badge className={getPriorityColor(entry.triage_priority)}>
                      {getPriorityLabel(entry.triage_priority)}
                    </Badge>
                  </td>

                  {/* Patient Info */}
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-[#1E1E1E]">
                        {entry.patient.first_name} {entry.patient.last_name}
                      </div>
                      <div className="text-sm text-[#6B7280] space-y-0.5">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.patient.afya_id}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {entry.patient.phone_primary}
                        </div>
                      </div>
                      {/* Alerts */}
                      {entry.patient.allergies.length > 0 && (
                        <Badge variant="outline" className="text-xs text-[#C84B31] border-[#C84B31] mt-1">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Allergies
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Chief Complaint */}
                  <td className="p-4">
                    <div className="max-w-[200px]">
                      <div className="text-sm text-[#1E1E1E]">
                        {entry.encounter.chief_complaint}
                      </div>
                      {entry.encounter.ai_triage_score && entry.encounter.ai_triage_score > 80 && (
                        <Badge variant="outline" className="text-xs mt-1">
                          <Activity className="h-3 w-3 mr-1" />
                          AI Risk: {entry.encounter.ai_triage_score}%
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Wait Time */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#6B7280]" />
                      <div>
                        <div className="font-medium text-[#1E1E1E]">
                          {calculateWaitTime(entry.arrival_time)}
                        </div>
                        <div className="text-xs text-[#6B7280]">
                          Est. {entry.estimated_wait_minutes} min
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {entry.status === 'waiting' && (
                      <Badge variant="outline" className="gap-2">
                        <Clock className="h-3 w-3" />
                        Waiting
                      </Badge>
                    )}
                    {entry.status === 'in-consultation' && (
                      <Badge className="gap-2 bg-[#2A9D8F]">
                        <Activity className="h-3 w-3" />
                        In Room
                      </Badge>
                    )}
                    {entry.status === 'completed' && (
                      <Badge className="gap-2 bg-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Complete
                      </Badge>
                    )}
                  </td>

                  {/* Assigned Provider */}
                  <td className="p-4">
                    {entry.assigned_to_user_id ? (
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-[#2A9D8F]" />
                        <span className="text-sm">Dr. Mwangi</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => assignProvider(entry.queue_id, 'user-doctor-001')}
                      >
                        <User className="h-3 w-3" />
                        Assign
                      </Button>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex gap-2">
                      {entry.status === 'waiting' && (
                        <Button
                          size="sm"
                          onClick={() => callNextPatient(entry)}
                          className="gap-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                          Call
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* View patient details */}}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredQueue.length === 0 && (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-[#6B7280]" />
              <h3 className="text-lg font-medium text-[#1E1E1E] mb-2">
                No patients in queue
              </h3>
              <p className="text-sm text-[#6B7280]">
                {searchQuery 
                  ? 'No patients match your search criteria'
                  : 'Queue is empty for this department'
                }
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Average Wait Time Alert */}
      {stats.avgWaitTime > 60 && (
        <Card className="p-4 bg-[#FEF3E7] border-[#F4A261]">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-[#F4A261]" />
            <div>
              <h3 className="font-medium text-[#F4A261]">
                Long Wait Times Detected
              </h3>
              <p className="text-sm text-[#6B7280]">
                Average wait time is {Math.round(stats.avgWaitTime)} minutes. Consider adding more providers.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * TV DISPLAY MODE
 * Large format for waiting room displays
 */
export const QueueDisplayTV: React.FC<{ department: string }> = ({ department }) => {
  const [currentQueue, setCurrentQueue] = useState<Array<{ number: number; name: string; room: string }>>([
    { number: 1, name: 'Emmanuel K.', room: 'Room 1' },
    { number: 2, name: 'Amina S.', room: 'Room 2' },
    { number: 3, name: 'John M.', room: 'Waiting' }
  ]);

  return (
    <div className="min-h-screen bg-[#0F3D56] text-white p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">
          {department} Queue
        </h1>
        <p className="text-3xl text-[#E9C46A]">
          {new Date().toLocaleDateString('sw-TZ', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Current Patient */}
      <div className="bg-[#E9C46A] text-[#0F3D56] p-12 rounded-2xl mb-8 text-center">
        <div className="text-2xl mb-4">NOW SERVING</div>
        <div className="text-9xl font-bold mb-4">
          {currentQueue[0]?.number.toString().padStart(3, '0')}
        </div>
        <div className="text-4xl font-medium">
          {currentQueue[0]?.name}
        </div>
        <div className="text-3xl mt-4">
          → {currentQueue[0]?.room}
        </div>
      </div>

      {/* Next in Queue */}
      <div className="grid grid-cols-2 gap-8">
        {currentQueue.slice(1, 5).map((entry, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur p-8 rounded-xl"
          >
            <div className="text-xl mb-2">Queue #{entry.number.toString().padStart(3, '0')}</div>
            <div className="text-3xl font-medium">{entry.name}</div>
            <div className="text-xl text-[#E9C46A] mt-2">{entry.room}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
