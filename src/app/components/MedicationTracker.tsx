/**
 * MedicationTracker - Complete medication management interface
 * Track medications, doses, refills, and adherence
 */

import React, { useState, useEffect } from 'react';
import {
  Pill,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  ChevronLeft,
  TrendingUp,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { api } from '@/app/services/api';
import type { Medication as ApiMedication } from '@/app/services/supabase';
import { getAuthUserId } from '@/app/utils/auth';
import { toast } from 'sonner';

const MOCK_USER_ID = 'mock_user_001';


const translations = {
  sw: {
    title: 'Dawa Zangu',
    subtitle: 'Fuatilia dawa na kumbusho',
    tabs: {
      today: 'Leo',
      upcoming: 'Zijazo',
      history: 'Historia',
    },
    addMedication: 'Ongeza Dawa',
    takeNow: 'Tumia Sasa',
    taken: 'Imetumika',
    skip: 'Ruka',
    timeLeft: 'Muda Uliobaki',
    refillIn: 'Jaza Upya Baada ya',
    days: 'siku',
    adherenceRate: 'Kiwango cha Kufuata',
    guidance: 'Mwongozo',
    missedDoses: 'Kipimo Kilichokosekana',
    onTime: 'Kwa Wakati',
    late: 'Chelewa',
    noMedications: 'Hakuna Dawa Zilizoongezwa',
    tapToAdd: 'Gusa ili kuongeza dawa yako ya kwanza',
  },
  en: {
    title: 'My Medications',
    subtitle: 'Track medications and reminders',
    tabs: {
      today: 'Today',
      upcoming: 'Upcoming',
      history: 'History',
    },
    addMedication: 'Add Medication',
    takeNow: 'Take Now',
    taken: 'Taken',
    skip: 'Skip',
    timeLeft: 'Time Left',
    refillIn: 'Refill in',
    days: 'days',
    adherenceRate: 'Adherence Rate',
    guidance: 'Guidance',
    missedDoses: 'Missed Doses',
    onTime: 'On Time',
    late: 'Late',
    noMedications: 'No Medications Added',
    tapToAdd: 'Tap to add your first medication',
  },
};

interface MedicationUI {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  refillDays: number;
  dosesLeft: number;
  totalDoses: number;
  condition: string;
  missedDoses: number;
}

export function MedicationTracker({ onBack }: { onBack: () => void }) {
  const { language } = useApp();
  const t = translations[language];
  const [view, setView] = useState<'today' | 'upcoming' | 'history'>('today');
  const [showGuidance, setShowGuidance] = useState<MedicationUI | null>(null);
  
  // NEW: State management
  const [isLoading, setIsLoading] = useState(false);
  const [medications, setMedications] = useState<ApiMedication[]>([]);

  // Load medications on mount
  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    setIsLoading(true);
    const userId = await getAuthUserId() ?? MOCK_USER_ID;
    const response = await api.medications.list(userId);
    if (response.success && response.data) {
      setMedications(response.data);
    } else {
      toast.error(language === 'sw' ? 'Imeshindwa kupakia dawa' : 'Failed to load medications');
    }
    setIsLoading(false);
  };

  // Convert API medications to UI format
  const medicationsUI: MedicationUI[] = medications.map((med) => ({
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    times: med.reminder_times,
    refillDays: 7, // TODO: Calculate from end_date
    dosesLeft: 15, // TODO: Calculate from usage tracking
    totalDoses: 30, // TODO: Calculate from prescription
    condition: '', // TODO: Add to schema
    missedDoses: 0, // TODO: Track in separate table
  }));

  // Calculate adherence
  const adherenceRate = 85; // Mock: would be calculated from history

  // Get today's schedule
  const todaySchedule = medicationsUI.flatMap((med) =>
    med.times.map((time) => ({
      ...med,
      scheduledTime: time,
      taken: Math.random() > 0.3, // Mock status
    }))
  );

  return (
    <div className="min-h-screen bg-[#F7F9FB] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{language === 'sw' ? 'Rudi' : 'Back'}</span>
          </button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
            <Pill className="w-8 h-8 text-blue-600" />
          </div>

          {/* Adherence Card */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.adherenceRate}</p>
                <p className="text-3xl font-bold text-green-700">{adherenceRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{t.thisWeek}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 flex gap-4">
          {(['today', 'upcoming', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`py-3 px-4 border-b-2 transition-all font-semibold text-sm ${
                view === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.tabs[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* TODAY VIEW */}
        {view === 'today' && (
          <div className="space-y-6">
            {/* Alerts */}
            {medicationsUI.some((med) => med.refillDays <= 3 || med.missedDoses > 0) && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-gray-900">{language === 'sw' ? 'Tahadhari' : 'Alerts'}</h2>
                {medicationsUI.map((med) => {
                  if (med.missedDoses > 0 || med.refillDays <= 3) {
                    return (
                      <button
                        key={med.id}
                        onClick={() => setShowGuidance(med)}
                        className="w-full text-left"
                      >
                        <div className={`p-4 rounded-xl border-2 ${
                          med.dosesLeft === 0
                            ? 'bg-red-50 border-red-500'
                            : med.refillDays <= 3
                            ? 'bg-orange-50 border-orange-500'
                            : 'bg-amber-50 border-amber-500'
                        }`}>
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`w-5 h-5 ${
                              med.dosesLeft === 0 ? 'text-red-600' : 'text-orange-600'
                            }`} />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{med.name}</p>
                              <p className="text-sm text-gray-700">
                                {med.missedDoses > 0 &&
                                  (language === 'sw'
                                    ? `${med.missedDoses} kipimo umekosa`
                                    : `${med.missedDoses} doses missed`)}
                                {med.refillDays <= 3 &&
                                  (language === 'sw'
                                    ? ` • Jaza tena ndani ya siku ${med.refillDays}`
                                    : ` • Refill in ${med.refillDays} days`)}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Today's Schedule */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t.dailySchedule}</h2>
              <div className="space-y-3">
                {todaySchedule.map((item, idx) => (
                  <motion.div
                    key={`${item.id}-${item.scheduledTime}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-white rounded-xl border-2 p-4 ${
                      item.taken ? 'border-green-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          item.taken ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {item.taken ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Pill className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.name} {item.dosage}
                          </p>
                          <p className="text-sm text-gray-600">
                            <Clock className="w-3.5 h-3.5 inline mr-1" />
                            {item.scheduledTime} • {item.condition}
                          </p>
                        </div>
                      </div>

                      {!item.taken && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                          {t.takeMedication}
                        </button>
                      )}
                      {item.taken && (
                        <span className="text-sm font-semibold text-green-600">{t.taken}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* All Medications */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'sw' ? 'Dawa Zote' : 'All Medications'}
              </h2>
              <div className="space-y-4">
                {medicationsUI.map((med, index) => {
                  const isLowStock = med.dosesLeft <= 3;
                  const isRefillUrgent = med.refillDays <= 3;
                  const stockPercentage = (med.dosesLeft / med.totalDoses) * 100;
                  
                  return (
                    <motion.div
                      key={med.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      {/* Status Indicator Bar */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                        style={{
                          backgroundColor: isLowStock ? '#EF4444' : isRefillUrgent ? '#F59E0B' : '#10B981'
                        }}
                      />
                      
                      <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 pl-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200">
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex gap-3 flex-1">
                            {/* Pill Icon */}
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                              style={{
                                background: isLowStock 
                                  ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
                                  : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
                              }}
                            >
                              <Pill 
                                className="w-6 h-6" 
                                style={{ color: isLowStock ? '#DC2626' : '#2563EB' }}
                              />
                            </div>
                            
                            {/* Medication Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1">
                                <h3 className="font-bold text-[17px] text-gray-900 leading-tight">
                                  {med.name}
                                </h3>
                                {(isLowStock || isRefillUrgent) && (
                                  <span 
                                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
                                    style={{
                                      backgroundColor: isLowStock ? '#FEE2E2' : '#FEF3C7',
                                      color: isLowStock ? '#DC2626' : '#D97706'
                                    }}
                                  >
                                    {isLowStock ? (language === 'sw' ? 'CHINI' : 'LOW') : (language === 'sw' ? 'JAZA' : 'REFILL')}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-[15px] font-semibold text-blue-600 mb-1">
                                {med.dosage}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-3.5 h-3.5" />
                                  {med.frequency}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-500">{med.condition}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid - Redesigned */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {/* Doses Left Card */}
                          <div 
                            className="relative overflow-hidden rounded-xl p-4"
                            style={{
                              background: isLowStock
                                ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)'
                                : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
                            }}
                          >
                            <div className="relative z-10">
                              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" 
                                style={{ color: isLowStock ? '#991B1B' : '#166534' }}
                              >
                                {t.dosesLeft}
                              </p>
                              <div className="flex items-baseline gap-1 mb-2">
                                <span 
                                  className="text-[28px] font-black leading-none"
                                  style={{ color: isLowStock ? '#DC2626' : '#16A34A' }}
                                >
                                  {med.dosesLeft}
                                </span>
                                <span className="text-[14px] font-bold text-gray-500">
                                  /{med.totalDoses}
                                </span>
                              </div>
                              
                              {/* Animated Progress Bar */}
                              <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stockPercentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                  style={{
                                    background: isLowStock
                                      ? 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)'
                                      : 'linear-gradient(90deg, #16A34A 0%, #22C55E 100%)'
                                  }}
                                />
                              </div>
                            </div>
                            
                            {/* Background Icon */}
                            <Pill 
                              className="absolute -right-2 -bottom-2 w-16 h-16 opacity-10"
                              style={{ color: isLowStock ? '#DC2626' : '#16A34A' }}
                            />
                          </div>

                          {/* Refill Days Card */}
                          <div 
                            className="relative overflow-hidden rounded-xl p-4"
                            style={{
                              background: isRefillUrgent
                                ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
                                : 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                            }}
                          >
                            <div className="relative z-10">
                              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1"
                                style={{ color: isRefillUrgent ? '#92400E' : '#1E40AF' }}
                              >
                                {t.refillIn}
                              </p>
                              <div className="flex items-baseline gap-1.5 mb-1">
                                <span 
                                  className="text-[28px] font-black leading-none"
                                  style={{ color: isRefillUrgent ? '#D97706' : '#2563EB' }}
                                >
                                  {med.refillDays}
                                </span>
                                <span className="text-[14px] font-bold text-gray-500">
                                  {language === 'sw' ? 'siku' : 'days'}
                                </span>
                              </div>
                              
                              {/* Urgency Indicator */}
                              {isRefillUrgent && (
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span className="text-[10px] font-bold text-amber-600 uppercase">
                                    {language === 'sw' ? 'Haraka' : 'Urgent'}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Background Icon */}
                            <Calendar 
                              className="absolute -right-2 -bottom-2 w-16 h-16 opacity-10"
                              style={{ color: isRefillUrgent ? '#D97706' : '#2563EB' }}
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl group/btn transition-all duration-200"
                          style={{
                            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
                          }}
                        >
                          <span className="text-white font-semibold text-[14px]">
                            {language === 'sw' ? 'Angalia Maelezo' : 'View Details'}
                          </span>
                          <ChevronRight className="w-5 h-5 text-white group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* UPCOMING VIEW */}
        {view === 'upcoming' && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>{language === 'sw' ? 'Ratiba za baadaye' : 'Upcoming schedules'}</p>
          </div>
        )}

        {/* HISTORY VIEW */}
        {view === 'history' && (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>{language === 'sw' ? 'Historia ya dawa' : 'Medication history'}</p>
          </div>
        )}
      </div>

      {/* Missed Medication Guidance Modal */}
      {showGuidance && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <MissedMedicationGuidance
              medicationName={`${showGuidance.name} ${showGuidance.dosage}`}
              missedDoses={showGuidance.missedDoses}
              daysUntilRefill={showGuidance.refillDays}
              isOutOfStock={showGuidance.dosesLeft === 0}
              language={language}
              onContactCHW={() => {
                setShowGuidance(null);
                // Handle CHW contact
              }}
              onMarkTaken={() => {
                setShowGuidance(null);
                // Handle mark as taken
              }}
              onRequestRefill={() => {
                setShowGuidance(null);
                // Handle refill request
              }}
            />
            <button
              onClick={() => setShowGuidance(null)}
              className="mt-4 w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl"
            >
              {language === 'sw' ? 'Funga' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}