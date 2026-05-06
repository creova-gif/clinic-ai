import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Phone, Plus } from 'lucide-react';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { AnimatedButton } from '@/app/components/ui/AnimatedButton';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { useApp } from '@/app/context/AppContext';

const translations = {
  sw: {
    title: 'Miadi Yangu',
    upcoming: 'Ijayo',
    past: 'Iliyopita',
    noUpcoming: 'Hakuna miadi',
    bookNew: 'Panga Miadi',
    facility: 'Kituo',
    doctor: 'Daktari',
    reason: 'Sababu',
    status: 'Hali',
    confirmed: 'Imethibitishwa',
    pending: 'Inasubiri',
    completed: 'Imekamilika',
    cancelled: 'Imefutwa',
    getDirections: 'Maelekezo',
    callFacility: 'Piga Simu',
    reminderSet: 'Ukumbusho umewekwa',
    beforeAppointment: 'saa 1 kabla',
  },
  en: {
    title: 'My Appointments',
    upcoming: 'Upcoming',
    past: 'Past',
    noUpcoming: 'No appointments',
    bookNew: 'Book Appointment',
    facility: 'Facility',
    doctor: 'Doctor',
    reason: 'Reason',
    status: 'Status',
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    getDirections: 'Directions',
    callFacility: 'Call Facility',
    reminderSet: 'Reminder set',
    beforeAppointment: '1 hour before',
  },
};

interface AppointmentsScreenProps {
  onBack: () => void;
}

type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

interface Appointment {
  id: number;
  date: string;
  time: string;
  facility: string;
  doctor: string;
  reason: string;
  status: AppointmentStatus;
  distance?: string;
  phone?: string;
}

function getStatusConfig(status: AppointmentStatus, t: typeof translations['en']) {
  switch (status) {
    case 'confirmed':
      return { variant: 'info' as const, label: t.confirmed, borderColor: 'border-l-[#6366f1]' };
    case 'pending':
      return { variant: 'pending' as const, label: t.pending, borderColor: 'border-l-[#6366f1]' };
    case 'completed':
      return { variant: 'success' as const, label: t.completed, borderColor: 'border-l-[#10b981]' };
    case 'cancelled':
      return { variant: 'danger' as const, label: t.cancelled, borderColor: 'border-l-[#ef4444]' };
  }
}

export function AppointmentsScreen({ onBack }: AppointmentsScreenProps) {
  const { language } = useApp();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingAppointments: Appointment[] = [
    {
      id: 1,
      date: language === 'sw' ? 'Jumatatu, Jan 20, 2026' : 'Monday, Jan 20, 2026',
      time: '10:00 AM',
      facility: 'Mwananyamala Hospital',
      doctor: language === 'sw' ? 'Dkt. Amina Mbwana' : 'Dr. Amina Mbwana',
      reason: language === 'sw' ? 'Ukaguzi wa kawaida' : 'Routine checkup',
      status: 'confirmed',
      distance: '2.3 km',
      phone: '+255 22 215 0174',
    },
    {
      id: 2,
      date: language === 'sw' ? 'Ijumaa, Jan 24, 2026' : 'Friday, Jan 24, 2026',
      time: '2:00 PM',
      facility: 'Kigogo Health Center',
      doctor: language === 'sw' ? 'Nesi Mary John' : 'Nurse Mary John',
      reason: language === 'sw' ? 'Chanjo ya watoto' : 'Child vaccination',
      status: 'pending',
      distance: '1.5 km',
      phone: '+255 22 286 0120',
    },
  ];

  const pastAppointments: Appointment[] = [
    {
      id: 3,
      date: language === 'sw' ? 'Ijumaa, Jan 10, 2026' : 'Friday, Jan 10, 2026',
      time: '9:00 AM',
      facility: 'Mwananyamala Hospital',
      doctor: language === 'sw' ? 'Dkt. Joseph Kamara' : 'Dr. Joseph Kamara',
      reason: language === 'sw' ? 'Shinikizo la damu' : 'Blood pressure check',
      status: 'completed',
    },
  ];

  const activeList = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <main role="main" className="min-h-screen bg-[#FFF9F5] pb-20">
      <HeroHeader greeting={t.title}>
        {/* Tab switcher in header */}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            aria-label={t.upcoming}
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all min-h-[40px] ${
              activeTab === 'upcoming'
                ? 'bg-white text-[#1e1b4b]'
                : 'bg-white/20 text-white'
            }`}
          >
            {t.upcoming}
          </button>
          <button
            type="button"
            aria-label={t.past}
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all min-h-[40px] ${
              activeTab === 'past'
                ? 'bg-white text-[#1e1b4b]'
                : 'bg-white/20 text-white'
            }`}
          >
            {t.past}
          </button>
        </div>
      </HeroHeader>

      <div className="px-4 py-5 space-y-4">
        {activeList.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <span className="text-6xl" aria-hidden="true">📅</span>
            <p className="text-base font-semibold text-gray-500">
              {t.noUpcoming}
            </p>
            <AnimatedButton
              type="button"
              aria-label={t.bookNew}
              variant="primary"
              size="md"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t.bookNew}
            </AnimatedButton>
          </motion.div>
        ) : (
          activeList.map((appointment, i) => {
            const statusCfg = getStatusConfig(appointment.status, t);
            return (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className={`bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-l-4 ${statusCfg.borderColor} overflow-hidden`}
              >
                <div className="p-4">
                  {/* Top row: doctor + badge */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-[#1e1b4b] text-base leading-snug">
                        {appointment.doctor}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {appointment.facility}
                      </p>
                    </div>
                    <StatusBadge
                      variant={statusCfg.variant}
                      label={statusCfg.label}
                    />
                  </div>

                  {/* Date + time */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                      <Calendar className="w-4 h-4 text-[#6366f1]" aria-hidden="true" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                      <Clock className="w-4 h-4 text-[#6366f1]" aria-hidden="true" />
                      {appointment.time}
                    </div>
                  </div>

                  {/* Reason */}
                  <p className="text-sm text-gray-600 mt-2">{appointment.reason}</p>

                  {/* Action buttons — only for upcoming with phone */}
                  {appointment.phone && (
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        aria-label={t.getDirections}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
                      >
                        <MapPin className="w-4 h-4" aria-hidden="true" />
                        {t.getDirections}
                        {appointment.distance && (
                          <span className="text-xs text-gray-400">
                            · {appointment.distance}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        aria-label={t.callFacility}
                        onClick={() => (window.location.href = `tel:${appointment.phone}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
                      >
                        <Phone className="w-4 h-4" aria-hidden="true" />
                        {t.callFacility}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <AnimatedButton
          type="button"
          aria-label={t.bookNew}
          variant="primary"
          size="md"
          className="rounded-full w-14 h-14 p-0 shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
        >
          <Plus className="w-6 h-6" aria-hidden="true" />
        </AnimatedButton>
      </div>
    </main>
  );
}
