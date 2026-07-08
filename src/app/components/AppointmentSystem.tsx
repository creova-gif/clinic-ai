/**
 * AppointmentSystem - Book, Reschedule, Cancel with Queue Transparency
 * Live queue status, estimated wait times, facility load visibility
 * Reduces frustration and no-shows
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle, AlertCircle, Phone, Plus, Edit, X, User, Users, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { api } from '@/app/services/api';
import type { Appointment as ApiAppointment, Facility as ApiFacility } from '@/app/services/supabase';
import { getAuthUserId } from '@/app/utils/auth';
import { toast } from 'sonner';

const MOCK_USER_ID = 'mock_user_001';


interface AppointmentSystemProps {
  language: 'sw' | 'en';
  onBack: () => void;
}

// Local UI types
interface AppointmentUI {
  id: string;
  date: Date;
  time: string;
  type: { sw: string; en: string };
  provider: { sw: string; en: string };
  facility: { sw: string; en: string };
  status: 'upcoming' | 'completed' | 'cancelled';
  queuePosition?: number;
  estimatedWait?: number;
  facilityLoad?: 'low' | 'medium' | 'high';
}

interface FacilityUI {
  id: string;
  name: { sw: string; en: string };
  address: { sw: string; en: string };
  currentLoad: 'low' | 'medium' | 'high';
  waitTime: number;
  availableSlots: number;
  distance?: string;
}

export function AppointmentSystem({ language, onBack }: AppointmentSystemProps) {
  const [view, setView] = useState<'list' | 'book' | 'details'>('list');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentUI | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<FacilityUI | null>(null);
  
  // NEW: Multi-step booking wizard state
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [bookingData, setBookingData] = useState({
    facility: null as FacilityUI | null,
    date: '',
    time: '',
    reason: '',
    hasInsurance: false,
  });

  // NEW: Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [facilities, setFacilities] = useState<ApiFacility[]>([]);

  // Load appointments on mount
  useEffect(() => {
    loadAppointments();
    loadFacilities();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    const userId = await getAuthUserId() ?? MOCK_USER_ID;
    const response = await api.appointments.list(userId);
    if (response.success && response.data) {
      setAppointments(response.data);
    } else {
      toast.error(language === 'sw' ? 'Imeshindwa kupakia miadi' : 'Failed to load appointments');
    }
    setIsLoading(false);
  };

  const loadFacilities = async () => {
    const response = await api.facilities.list();
    if (response.success && response.data) {
      setFacilities(response.data);
    }
  };

  // Convert API facilities to UI format
  const facilitiesUI: FacilityUI[] = facilities.map((f) => ({
    id: f.id,
    name: { sw: f.name_sw, en: f.name },
    address: { sw: f.address_sw, en: f.address },
    currentLoad: f.current_load || 'medium',
    waitTime: f.wait_time_minutes || 30,
    availableSlots: 15, // TODO: Calculate from API
    distance: undefined, // TODO: Calculate from user location
  }));

  const content = {
    sw: {
      title: 'Miadi Yangu',
      subtitle: 'Panga na simamia miadi yako',
      tabs: {
        upcoming: 'Inayokuja',
        past: 'Iliyopita',
      },
      bookNew: 'Panga Miadi Mpya',
      emptyUpcoming: 'Hakuna miadi inayokuja',
      emptyPast: 'Hakuna miadi iliyopita',
      emptyDescription: 'Miadi yako itaonekana hapa',
      viewDetails: 'Angalia Maelezo',
      reschedule: 'Badilisha Tarehe',
      cancel: 'Ghairi',
      queuePosition: 'Nafasi kwenye Foleni:',
      estimatedWait: 'Muda wa Kusubiri:',
      minutes: 'dakika',
      facilityLoad: 'Msongamano wa Kituo:',
      loadLevels: {
        low: 'Chini',
        medium: 'Wastani',
        high: 'Juu',
      },
      selectFacility: 'Chagua Kituo',
      availableSlots: 'Nafasi Zinazopatikana:',
      distance: 'Umbali:',
      bookAppointment: 'Panga Miadi',
      confirmBooking: 'Thibitisha Miadi',
      appointmentBooked: 'Miadi Imepangwa!',
      appointmentCancelled: 'Miadi Imeghairiwa',
      // NEW: Multi-step labels
      step: 'Hatua',
      of: 'ya',
      stepWhere: 'Wapi?',
      stepWhen: 'Lini?',
      stepDetails: 'Maelezo',
      selectDate: 'Chagua Tarehe',
      selectTime: 'Chagua Muda',
      reasonForVisit: 'Sababu ya Ziara',
      reasonOptional: '(Hiari)',
      hasInsuranceLabel: 'Nina Bima',
      back: 'Rudi',
      next: 'Endelea',
      status: {
        upcoming: 'Inakuja',
        completed: 'Imekamilika',
        cancelled: 'Imeghairiwa',
      },
    },
    en: {
      title: 'My Appointments',
      subtitle: 'Schedule and manage your appointments',
      tabs: {
        upcoming: 'Upcoming',
        past: 'Past',
      },
      bookNew: 'Book New Appointment',
      emptyUpcoming: 'No upcoming appointments',
      emptyPast: 'No past appointments',
      emptyDescription: 'Your appointments will appear here',
      viewDetails: 'View Details',
      reschedule: 'Reschedule',
      cancel: 'Cancel',
      queuePosition: 'Queue Position:',
      estimatedWait: 'Estimated Wait:',
      minutes: 'minutes',
      facilityLoad: 'Facility Load:',
      loadLevels: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      },
      selectFacility: 'Select Facility',
      availableSlots: 'Available Slots:',
      distance: 'Distance:',
      bookAppointment: 'Book Appointment',
      confirmBooking: 'Confirm Booking',
      appointmentBooked: 'Appointment Booked!',
      appointmentCancelled: 'Appointment Cancelled',
      // NEW: Multi-step labels
      step: 'Step',
      of: 'of',
      stepWhere: 'Where?',
      stepWhen: 'When?',
      stepDetails: 'Details',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      reasonForVisit: 'Reason for Visit',
      reasonOptional: '(Optional)',
      hasInsuranceLabel: 'I have insurance',
      back: 'Back',
      next: 'Next',
      status: {
        upcoming: 'Upcoming',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
    },
  };

  const t = content[language];

  // Mock appointments
  const mockAppointments: AppointmentUI[] = [
    {
      id: '1',
      date: new Date('2026-02-10'),
      time: '10:00 AM',
      type: { sw: 'Uchunguzi wa Kawaida', en: 'General Checkup' },
      provider: { sw: 'Dkt. Mwangi', en: 'Dr. Mwangi' },
      facility: { sw: 'Kituo cha Afya Kariakoo', en: 'Kariakoo Health Centre' },
      status: 'upcoming',
      queuePosition: 4,
      estimatedWait: 25,
      facilityLoad: 'medium',
    },
    {
      id: '2',
      date: new Date('2026-02-05'),
      time: '2:00 PM',
      type: { sw: 'Vipimo vya Damu', en: 'Blood Test' },
      provider: { sw: 'Lab Technician', en: 'Lab Technician' },
      facility: { sw: 'Kituo cha Afya Kariakoo', en: 'Kariakoo Health Centre' },
      status: 'completed',
    },
  ];

  // Mock facilities
  const mockFacilities: FacilityUI[] = [
    {
      id: '1',
      name: { sw: 'Kituo cha Afya Kariakoo', en: 'Kariakoo Health Centre' },
      address: { sw: 'Kariakoo, Dar es Salaam', en: 'Kariakoo, Dar es Salaam' },
      currentLoad: 'medium',
      waitTime: 30,
      availableSlots: 12,
      distance: '2.3 km',
    },
    {
      id: '2',
      name: { sw: 'Hospitali ya Rufaa Muhimbili', en: 'Muhimbili National Hospital' },
      address: { sw: 'Upanga, Dar es Salaam', en: 'Upanga, Dar es Salaam' },
      currentLoad: 'high',
      waitTime: 60,
      availableSlots: 3,
      distance: '5.1 km',
    },
    {
      id: '3',
      name: { sw: 'Kituo cha Afya Kinondoni', en: 'Kinondoni Health Centre' },
      address: { sw: 'Kinondoni, Dar es Salaam', en: 'Kinondoni, Dar es Salaam' },
      currentLoad: 'low',
      waitTime: 15,
      availableSlots: 24,
      distance: '7.8 km',
    },
  ];

  const upcomingAppointments = mockAppointments.filter(
    (a) => a.status === 'upcoming'
  );
  const pastAppointments = mockAppointments.filter(
    (a) => a.status !== 'upcoming'
  );

  // Helper: Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(`${hour}:00`);
      if (hour < 17) slots.push(`${hour}:30`);
    }
    return slots;
  };

  // Helper: Generate next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Helper: Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!bookingData.facility || !bookingData.date || !bookingData.time) {
      toast.error(language === 'sw' ? 'Tafadhali jaza sehemu zote' : 'Please fill all fields');
      return;
    }

    setIsLoading(true);

    try {
      const userId = await getAuthUserId() ?? MOCK_USER_ID;
      const response = await api.appointments.create({
        user_id: userId,
        facility_id: bookingData.facility.id,
        date: bookingData.date,
        time: bookingData.time,
        type: 'General Checkup', // TODO: Make configurable
        status: 'scheduled',
        reason: bookingData.reason,
        notes: '',
        has_insurance: bookingData.hasInsurance,
      });

      if (response.success && response.data) {
        toast.success(
          language === 'sw'
            ? `Miadi imepangwa! ${bookingData.facility.name.sw} - ${bookingData.date} ${bookingData.time}`
            : `Appointment booked! ${bookingData.facility.name.en} - ${bookingData.date} ${bookingData.time}`
        );

        // Reset and return to list
        setBookingData({
          facility: null,
          date: '',
          time: '',
          reason: '',
          hasInsurance: false,
        });
        setBookingStep(1);
        setView('list');
        
        // Reload appointments
        await loadAppointments();
      } else {
        throw response.error || new Error('Failed to book appointment');
      }
    } catch (error) {
      toast.error(
        language === 'sw'
          ? 'Imeshindwa kupanga miadi. Tafadhali jaribu tena.'
          : 'Failed to book appointment. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getLoadColor = (load: string) => {
    switch (load) {
      case 'low':
        return { bg: '#ECFDF5', text: '#10B981', border: '#A7F3D0' };
      case 'medium':
        return { bg: '#FFFBEB', text: '#F59E0B', border: '#FDE68A' };
      case 'high':
        return { bg: '#FEF2F2', text: '#EF4444', border: '#FECACA' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // List View
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-[#FAFBFC] pb-24">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-4 text-[#6B7280] hover:text-[#1A1D23] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                {language === 'sw' ? 'Rudi' : 'Back'}
              </span>
            </button>

            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-[#1E88E5]" />
              <h1 className="text-3xl font-bold text-[#1A1D23]">{t.title}</h1>
            </div>
            <p className="text-[#6B7280] text-base">{t.subtitle}</p>
          </div>
        </div>

        {/* Quick Action */}
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Button
            onClick={() => setView('book')}
            className="w-full h-14 bg-[#1E88E5] hover:bg-[#1976D2] text-base font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.bookNew}
          </Button>
        </div>

        {/* Upcoming Appointments */}
        <div className="max-w-4xl mx-auto px-6 pb-6">
          <h2 className="text-xl font-semibold text-[#1A1D23] mb-4">
            {t.tabs.upcoming}
          </h2>

          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
              <Calendar className="w-16 h-16 text-[#D1D5DB] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1A1D23] mb-2">
                {t.emptyUpcoming}
              </h3>
              <p className="text-[#6B7280]">{t.emptyDescription}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt, index) => {
                const loadColors = apt.facilityLoad
                  ? getLoadColor(apt.facilityLoad)
                  : null;

                return (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-[#E5E7EB] p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1A1D23] mb-1">
                          {apt.type[language]}
                        </h3>
                        <p className="text-[#6B7280] text-sm">
                          {formatDate(apt.date)} • {apt.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] rounded-full">
                        <CheckCircle className="w-4 h-4 text-[#1E88E5]" />
                        <span className="text-xs font-medium text-[#1E88E5]">
                          {t.status.upcoming}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <User className="w-4 h-4" />
                        <span>{apt.provider[language]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <MapPin className="w-4 h-4" />
                        <span>{apt.facility[language]}</span>
                      </div>
                    </div>

                    {/* Queue Info */}
                    {apt.queuePosition && apt.estimatedWait && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-[#FAFBFC] rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-[#1E88E5]" />
                            <span className="text-xs text-[#6B7280]">
                              {t.queuePosition}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-[#1A1D23]">
                            #{apt.queuePosition}
                          </p>
                        </div>
                        <div className="p-3 bg-[#FAFBFC] rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-[#1E88E5]" />
                            <span className="text-xs text-[#6B7280]">
                              {t.estimatedWait}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-[#1A1D23]">
                            {apt.estimatedWait}
                            <span className="text-sm font-normal text-[#6B7280] ml-1">
                              {t.minutes}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Facility Load */}
                    {loadColors && apt.facilityLoad && (
                      <div
                        className="p-3 rounded-lg mb-4"
                        style={{
                          backgroundColor: loadColors.bg,
                          borderColor: loadColors.border,
                          borderWidth: '1px',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Activity
                            className="w-4 h-4"
                            style={{ color: loadColors.text }}
                          />
                          <span
                            className="text-sm font-medium"
                            style={{ color: loadColors.text }}
                          >
                            {t.facilityLoad} {t.loadLevels[apt.facilityLoad]}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setView('details');
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        {t.viewDetails}
                      </Button>
                      <Button variant="outline" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-[#EF4444]">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div className="max-w-4xl mx-auto px-6 pb-6">
            <h2 className="text-xl font-semibold text-[#1A1D23] mb-4">
              {t.tabs.past}
            </h2>
            <div className="space-y-3">
              {pastAppointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border border-[#E5E7EB] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-[#1A1D23]">
                        {apt.type[language]}
                      </h4>
                      <p className="text-sm text-[#6B7280]">
                        {formatDate(apt.date)} • {apt.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ECFDF5] rounded-full">
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      <span className="text-xs font-medium text-[#10B981]">
                        {t.status.completed}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Book New Appointment View
  if (view === 'book') {
    // ========================================
    // PROGRESS BAR COMPONENT
    // ========================================
    const ProgressBar = ({ current, total }: { current: number; total: number }) => {
      return (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#6B7280]">
              {t.step} {current} {t.of} {total}
            </span>
            <span className="text-sm text-[#6B7280]">
              {Math.round((current / total) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#1E88E5]"
              initial={{ width: 0 }}
              animate={{ width: `${(current / total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-[#FAFBFC] pb-24">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <button
              onClick={() => {
                // Reset wizard on cancel
                setBookingStep(1);
                setBookingData({
                  facility: null,
                  date: '',
                  time: '',
                  reason: '',
                  hasInsurance: false,
                });
                setView('list');
              }}
              className="flex items-center gap-2 mb-4 text-[#6B7280] hover:text-[#1A1D23] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">{t.back}</span>
            </button>

            <h1 className="text-2xl font-bold text-[#1A1D23] mb-2">{t.bookNew}</h1>
            <p className="text-[#6B7280]">
              {bookingStep === 1 && (language === 'sw' ? 'Chagua kituo cha afya' : 'Select a health facility')}
              {bookingStep === 2 && (language === 'sw' ? 'Chagua tarehe na muda' : 'Select date and time')}
              {bookingStep === 3 && (language === 'sw' ? 'Ongeza maelezo ya ziara' : 'Add visit details')}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6">
          <ProgressBar current={bookingStep} total={3} />

          {/* ========================================
              STEP 1: WHERE? (Facility Selection)
              ======================================== */}
          {bookingStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1A1D23] mb-4">
                {t.stepWhere}
              </h2>

              {mockFacilities.map((facility, index) => {
                const loadColors = getLoadColor(facility.currentLoad);
                const isSelected = bookingData.facility?.id === facility.id;

                return (
                  <motion.button
                    key={facility.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setBookingData({ ...bookingData, facility });
                      setBookingStep(2);
                    }}
                    className={`w-full text-left bg-white rounded-xl border-2 p-6 hover:shadow-md transition-all ${
                      isSelected ? 'border-[#1E88E5]' : 'border-[#E5E7EB]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1A1D23] mb-1">
                          {facility.name[language]}
                        </h3>
                        <p className="text-sm text-[#6B7280] mb-2">
                          {facility.address[language]}
                        </p>
                        {facility.distance && (
                          <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {t.distance} {facility.distance}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-[#FAFBFC] rounded-lg">
                        <p className="text-xl font-bold text-[#1A1D23]">
                          {facility.availableSlots}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1">{t.availableSlots}</p>
                      </div>
                      <div className="text-center p-3 bg-[#FAFBFC] rounded-lg">
                        <p className="text-xl font-bold text-[#1A1D23]">
                          {facility.waitTime}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1">{t.minutes}</p>
                      </div>
                      <div
                        className="text-center p-3 rounded-lg"
                        style={{
                          backgroundColor: loadColors.bg,
                          borderColor: loadColors.border,
                          borderWidth: '1px',
                        }}
                      >
                        <p
                          className="text-sm font-bold"
                          style={{ color: loadColors.text }}
                        >
                          {t.loadLevels[facility.currentLoad]}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1">{t.facilityLoad}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* ========================================
              STEP 2: WHEN? (Date & Time Selection)
              ======================================== */}
          {bookingStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-[#1A1D23]">
                {t.stepWhen}
              </h2>

              {/* Selected Facility Summary */}
              <div className="bg-white border-2 border-[#E5E7EB] rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Kituo ulichochagua:' : 'Selected facility:'}</span>
                </div>
                <p className="font-semibold text-[#1A1D23]">
                  {bookingData.facility?.name[language]}
                </p>
              </div>

              {/* Date Selection */}
              <div className="bg-white border-2 border-[#E5E7EB] rounded-xl p-6">
                <label className="block text-sm font-semibold text-[#1A1D23] mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {t.selectDate}
                </label>
                <select
                  value={bookingData.date}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, date: e.target.value })
                  }
                  className="w-full p-3 border-2 border-[#E5E7EB] rounded-lg text-[#1A1D23] font-medium focus:border-[#1E88E5] focus:outline-none"
                  style={{ minHeight: '48px' }}
                >
                  <option value="">
                    {language === 'sw' ? 'Chagua tarehe...' : 'Select date...'}
                  </option>
                  {generateDates().map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const displayDate = date.toLocaleDateString(
                      language === 'sw' ? 'sw-TZ' : 'en-US',
                      { weekday: 'long', month: 'long', day: 'numeric' }
                    );
                    return (
                      <option key={dateStr} value={dateStr}>
                        {displayDate}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Time Selection */}
              {bookingData.date && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-2 border-[#E5E7EB] rounded-xl p-6"
                >
                  <label className="block text-sm font-semibold text-[#1A1D23] mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    {t.selectTime}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {generateTimeSlots().map((slot) => (
                      <button
                        key={slot}
                        onClick={() => {
                          setBookingData({ ...bookingData, time: slot });
                          setBookingStep(3);
                        }}
                        className={`p-3 rounded-lg border-2 font-medium transition-all ${
                          bookingData.time === slot
                            ? 'bg-[#1E88E5] text-white border-[#1E88E5]'
                            : 'bg-white text-[#1A1D23] border-[#E5E7EB] hover:border-[#1E88E5]'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Back Button */}
              <Button
                onClick={() => setBookingStep(1)}
                variant="outline"
                className="w-full h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Button>
            </motion.div>
          )}

          {/* ========================================
              STEP 3: DETAILS (Reason & Insurance)
              ======================================== */}
          {bookingStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-[#1A1D23]">
                {t.stepDetails}
              </h2>

              {/* Booking Summary */}
              <div className="bg-white border-2 border-[#E5E7EB] rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-[#1A1D23] mb-3">
                  {language === 'sw' ? 'Muhtasari wa Miadi' : 'Appointment Summary'}
                </h3>
                
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-[#6B7280] mt-0.5" />
                  <div>
                    <p className="text-[#6B7280]">
                      {language === 'sw' ? 'Kituo' : 'Facility'}
                    </p>
                    <p className="font-semibold text-[#1A1D23]">
                      {bookingData.facility?.name[language]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-[#6B7280] mt-0.5" />
                  <div>
                    <p className="text-[#6B7280]">
                      {language === 'sw' ? 'Tarehe na Muda' : 'Date & Time'}
                    </p>
                    <p className="font-semibold text-[#1A1D23]">
                      {new Date(bookingData.date).toLocaleDateString(
                        language === 'sw' ? 'sw-TZ' : 'en-US',
                        { weekday: 'long', month: 'long', day: 'numeric' }
                      )}{' '}
                      • {bookingData.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason for Visit */}
              <div className="bg-white border-2 border-[#E5E7EB] rounded-xl p-6">
                <label className="block text-sm font-semibold text-[#1A1D23] mb-2">
                  {t.reasonForVisit} <span className="text-[#6B7280] font-normal">{t.reasonOptional}</span>
                </label>
                <textarea
                  value={bookingData.reason}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, reason: e.target.value })
                  }
                  maxLength={200}
                  rows={4}
                  placeholder={
                    language === 'sw'
                      ? 'Eleza kwa ufupi sababu ya kuja kliniki...'
                      : 'Briefly describe your reason for visiting...'
                  }
                  className="w-full p-3 border-2 border-[#E5E7EB] rounded-lg text-[#1A1D23] focus:border-[#1E88E5] focus:outline-none resize-none"
                />
                <p className="text-xs text-[#6B7280] mt-2">
                  {bookingData.reason.length}/200
                </p>
              </div>

              {/* Insurance */}
              <div className="bg-white border-2 border-[#E5E7EB] rounded-xl p-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingData.hasInsurance}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, hasInsurance: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-2 border-[#E5E7EB] text-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5] focus:ring-offset-2"
                  />
                  <span className="text-sm font-medium text-[#1A1D23]">
                    {t.hasInsuranceLabel}
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleConfirmBooking}
                  className="w-full h-14 bg-[#1E88E5] hover:bg-[#1976D2] text-lg font-semibold"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {t.confirmBooking}
                </Button>

                <Button
                  onClick={() => setBookingStep(2)}
                  variant="outline"
                  className="w-full h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.back}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return null;
}