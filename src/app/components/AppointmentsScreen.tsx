import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Calendar as CalendarIcon, ChevronLeft, Clock, MapPin, Phone, Plus, X } from 'lucide-react';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { AnimatedButton } from '@/app/components/ui/AnimatedButton';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { ConfettiCelebration } from '@/app/components/ui/ConfettiCelebration';
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

// ── Calendar strip helpers ──────────────────────────────────────────────────
function buildCalendarDays(month: Date): Array<{ date: Date; hasAppt: boolean }> {
  const year = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    date: new Date(year, m, i + 1),
    hasAppt: false,
  }));
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const DAY_ABBR_SW = ['Jum', 'Jt2', 'Jt3', 'Jt4', 'Ijm', 'Jmo', 'Jap'];
const DAY_ABBR_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_SW = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTH_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Booking bottom-sheet steps
const SPECIALTIES_SW = ['Dawa za Jumla', 'Uzazi na Wanawake', 'Watoto', 'Meno', 'Macho', 'Ngozi'];
const SPECIALTIES_EN = ['General Medicine', 'Obstetrics & Gynecology', 'Pediatrics', 'Dental', 'Eye Care', 'Dermatology'];

const CLINICS = ['Mwananyamala Hospital', 'Kigogo Health Center', 'Sinza Dispensary', 'Kariakoo Clinic'];

// ── Status helper ───────────────────────────────────────────────────────────
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

  // Calendar strip state
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarDays = buildCalendarDays(today);
  const dayAbbr = language === 'sw' ? DAY_ABBR_SW : DAY_ABBR_EN;
  const monthLabel = language === 'sw' ? MONTH_SW[today.getMonth()] : MONTH_EN[today.getMonth()];

  // Booking bottom-sheet state
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [bookingSpecialty, setBookingSpecialty] = useState('');
  const [bookingClinic, setBookingClinic] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const specialties = language === 'sw' ? SPECIALTIES_SW : SPECIALTIES_EN;

  const handleBookingConfirm = () => {
    setShowBooking(false);
    setBookingStep(1);
    setBookingSpecialty('');
    setBookingClinic('');
    setBookingDate('');
    setBookingTime('');
    setShowConfetti(true);
  };

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
      <ConfettiCelebration trigger={showConfetti} onDone={() => setShowConfetti(false)} />

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

      {/* ── Calendar strip ────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          {monthLabel} {today.getFullYear()}
        </p>
        <div
          ref={calendarRef}
          role="group"
          aria-label={language === 'sw' ? 'Kalenda ya mwezi' : 'Month calendar'}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {calendarDays.map(({ date }) => {
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDate);
            const dayOfWeek = date.getDay();
            return (
              <button
                key={date.toISOString()}
                type="button"
                aria-label={`${dayAbbr[dayOfWeek]} ${date.getDate()}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 snap-start flex flex-col items-center rounded-2xl py-2.5 w-12 min-h-[64px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] ${
                  isSelected
                    ? 'bg-[#6366f1] text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]'
                    : isToday
                    ? 'bg-[#EEF2FF] text-[#6366f1] border border-[#6366f1]'
                    : 'bg-white text-[#1e1b4b] shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                }`}
              >
                <span className={`text-[9px] font-semibold uppercase ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {dayAbbr[dayOfWeek]}
                </span>
                <span className="text-base font-bold mt-0.5">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
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
          onClick={() => { setShowBooking(true); setBookingStep(1); }}
          className="rounded-full w-14 h-14 p-0 shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
        >
          <Plus className="w-6 h-6" aria-hidden="true" />
        </AnimatedButton>
      </div>

      {/* ── Booking bottom-sheet ─────────────────────────────────────── */}
      <AnimatePresence>
        {showBooking && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBooking(false)}
              className="fixed inset-0 bg-black/40 z-50"
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl pb-[env(safe-area-inset-bottom)] max-h-[85vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label={t.bookNew}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    {language === 'sw' ? `Hatua ${bookingStep} kati ya 3` : `Step ${bookingStep} of 3`}
                  </p>
                  <h3 className="text-lg font-bold text-[#1e1b4b]">
                    {bookingStep === 1
                      ? (language === 'sw' ? 'Chagua Huduma' : 'Select Specialty')
                      : bookingStep === 2
                      ? (language === 'sw' ? 'Chagua Kliniki' : 'Choose Clinic')
                      : (language === 'sw' ? 'Chagua Wakati' : 'Pick Date & Time')}
                  </h3>
                </div>
                <button
                  type="button"
                  aria-label={language === 'sw' ? 'Funga' : 'Close'}
                  onClick={() => setShowBooking(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Specialty */}
              {bookingStep === 1 && (
                <div className="px-5 py-4 space-y-3">
                  {specialties.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      aria-label={spec}
                      onClick={() => { setBookingSpecialty(spec); setBookingStep(2); }}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all min-h-[56px] ${
                        bookingSpecialty === spec
                          ? 'border-[#6366f1] bg-[#EEF2FF] text-[#1e1b4b]'
                          : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-[#6366f1]'
                      }`}
                    >
                      <span className="font-semibold text-sm">{spec}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Clinic */}
              {bookingStep === 2 && (
                <div className="px-5 py-4 space-y-3">
                  <button
                    type="button"
                    aria-label={language === 'sw' ? 'Rudi' : 'Back'}
                    onClick={() => setBookingStep(1)}
                    className="flex items-center gap-1 text-sm text-gray-500 mb-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {bookingSpecialty}
                  </button>
                  {CLINICS.map((clinic) => (
                    <button
                      key={clinic}
                      type="button"
                      aria-label={clinic}
                      onClick={() => { setBookingClinic(clinic); setBookingStep(3); }}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all min-h-[56px] ${
                        bookingClinic === clinic
                          ? 'border-[#6366f1] bg-[#EEF2FF] text-[#1e1b4b]'
                          : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-[#6366f1]'
                      }`}
                    >
                      <span className="font-semibold text-sm">{clinic}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Date + Time */}
              {bookingStep === 3 && (
                <div className="px-5 py-4 space-y-4">
                  <button
                    type="button"
                    aria-label={language === 'sw' ? 'Rudi' : 'Back'}
                    onClick={() => setBookingStep(2)}
                    className="flex items-center gap-1 text-sm text-gray-500"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {bookingClinic}
                  </button>

                  <div>
                    <label htmlFor="booking-date" className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {language === 'sw' ? 'Tarehe' : 'Date'}
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={today.toISOString().split('T')[0]}
                      className="mt-1.5 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-[#1e1b4b] font-medium min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      {language === 'sw' ? 'Wakati' : 'Time'}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {['8:00', '9:00', '10:00', '11:00', '14:00', '15:00'].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          aria-label={slot}
                          aria-pressed={bookingTime === slot}
                          onClick={() => setBookingTime(slot)}
                          className={`py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                            bookingTime === slot
                              ? 'bg-[#6366f1] text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]'
                              : 'bg-gray-50 text-gray-700 border border-gray-100 hover:border-[#6366f1]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatedButton
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={!bookingDate || !bookingTime}
                    aria-label={language === 'sw' ? 'Thibitisha Miadi' : 'Confirm Appointment'}
                    onClick={handleBookingConfirm}
                    className="mt-2"
                  >
                    <CalendarIcon className="w-5 h-5" aria-hidden="true" />
                    {language === 'sw' ? 'Thibitisha Miadi' : 'Confirm Appointment'}
                  </AnimatedButton>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
