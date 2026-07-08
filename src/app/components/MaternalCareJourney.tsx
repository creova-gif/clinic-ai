/**
 * MaternalCareJourney - Complete Pregnancy & Child Care Journey
 * Week-by-week guidance, immunization tracking
 * Risk alerts, appointment reminders
 * Complete end-to-end care experience
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Baby,
  Heart,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Bell,
  FileText,
  Activity,
  Pill,
  User,
  Phone,
  MapPin,
  Plus,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Button } from './ui/button';

interface MaternalCareJourneyProps {
  language: 'sw' | 'en';
  onBack: () => void;
  onNavigate: (route: string) => void;
}

interface PregnancyData {
  weekNumber: number;
  dueDate: Date;
  lastCheckup: Date;
  nextCheckup: Date;
  riskLevel: 'low' | 'medium' | 'high';
  immunizations: string[];
  weight: number;
  bloodPressure: string;
}

interface Milestone {
  week: number;
  title: { sw: string; en: string };
  description: { sw: string; en: string };
  completed: boolean;
}

interface ChildData {
  name: string;
  birthDate: Date;
  ageMonths: number;
  immunizations: {
    name: { sw: string; en: string };
    dueDate: Date;
    completed: boolean;
  }[];
  growth: {
    weight: number;
    height: number;
    date: Date;
  }[];
}

export function MaternalCareJourney({
  language,
  onBack,
  onNavigate,
}: MaternalCareJourneyProps) {
  const [mode, setMode] = useState<'pregnancy' | 'child'>('pregnancy');
  const [view, setView] = useState<'overview' | 'details' | 'tracking'>('overview');

  const content = {
    sw: {
      title: 'Mama na Mtoto',
      subtitle: 'Fuatilia safari yako ya uzazi na mtoto',
      tabs: {
        pregnancy: 'Mimba',
        child: 'Mtoto',
      },
      weekByWeek: 'Wiki kwa Wiki',
      currentWeek: 'Wiki ya Sasa',
      dueDate: 'Tarehe ya Kuzaa',
      nextAppointment: 'Miadi Inayofuata',
      riskLevel: 'Kiwango cha Hatari',
      immunizations: 'Chanjo',
      growth: 'Ukuaji',
      milestones: 'Hatua Muhimu',
      upcomingTasks: 'Kazi Zinazokuja',
      completed: 'Imekamilika',
      pending: 'Inasubiri',
      overdue: 'Imechelewa',
      bookCheckup: 'Panga Uchunguzi',
      contactCHW: 'Wasiliana na CHW',
      viewAllMilestones: 'Angalia Hatua Zote',
      addChild: 'Ongeza Mtoto',
      childName: 'Jina la Mtoto',
      age: 'Umri',
      months: 'miezi',
      riskLevels: {
        low: 'Chini',
        medium: 'Wastani',
        high: 'Juu',
      },
      thisWeek: 'Wiki hii',
      babyDevelopment: 'Maendeleo ya Mtoto',
      motherHealth: 'Afya ya Mama',
      tipsThisWeek: 'Vidokezo vya Wiki hii',
      warningSignsTitle: 'Dalili za Hatari',
      warningSigns: [
        'Kutokwa na damu nyingi',
        'Maumivu makali ya tumbo',
        'Homa ya juu',
        'Kuvimba kwa miguu na uso',
      ],
      emergencyContact: 'Wasiliana mara moja kama una dalili hizi',
    },
    en: {
      title: 'Mother & Child',
      subtitle: 'Track your pregnancy and child health journey',
      tabs: {
        pregnancy: 'Pregnancy',
        child: 'Child',
      },
      weekByWeek: 'Week by Week',
      currentWeek: 'Current Week',
      dueDate: 'Due Date',
      nextAppointment: 'Next Appointment',
      riskLevel: 'Risk Level',
      immunizations: 'Immunizations',
      growth: 'Growth',
      milestones: 'Milestones',
      upcomingTasks: 'Upcoming Tasks',
      completed: 'Completed',
      pending: 'Pending',
      overdue: 'Overdue',
      bookCheckup: 'Book Checkup',
      contactCHW: 'Contact CHW',
      viewAllMilestones: 'View All Milestones',
      addChild: 'Add Child',
      childName: 'Child Name',
      age: 'Age',
      months: 'months',
      riskLevels: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      },
      thisWeek: 'This week',
      babyDevelopment: 'Baby Development',
      motherHealth: 'Mother\'s Health',
      tipsThisWeek: 'Tips for This Week',
      warningSignsTitle: 'Warning Signs',
      warningSigns: [
        'Heavy bleeding',
        'Severe abdominal pain',
        'High fever',
        'Swelling of legs and face',
      ],
      emergencyContact: 'Contact immediately if you have these symptoms',
    },
  };

  const t = content[language];

  // Mock pregnancy data
  const pregnancyData: PregnancyData = {
    weekNumber: 24,
    dueDate: new Date('2026-06-15'),
    lastCheckup: new Date('2026-01-30'),
    nextCheckup: new Date('2026-02-13'),
    riskLevel: 'low',
    immunizations: ['Tetanus 1', 'Tetanus 2'],
    weight: 65,
    bloodPressure: '120/80',
  };

  // Mock milestones
  const milestones: Milestone[] = [
    {
      week: 12,
      title: { sw: 'Uchunguzi wa Kwanza', en: 'First Checkup' },
      description: {
        sw: 'Uchunguzi wa awali, vipimo vya damu, na ultrasound',
        en: 'Initial examination, blood tests, and ultrasound',
      },
      completed: true,
    },
    {
      week: 16,
      title: { sw: 'Chanjo ya Tetanus 1', en: 'Tetanus Vaccine 1' },
      description: {
        sw: 'Chanjo ya kwanza ya tetanus',
        en: 'First tetanus vaccination',
      },
      completed: true,
    },
    {
      week: 24,
      title: { sw: 'Uchunguzi wa Kati', en: 'Mid-Pregnancy Checkup' },
      description: {
        sw: 'Fuatilia ukuaji wa mtoto na afya ya mama',
        en: 'Monitor baby growth and mother\'s health',
      },
      completed: false,
    },
    {
      week: 28,
      title: { sw: 'Chanjo ya Tetanus 2', en: 'Tetanus Vaccine 2' },
      description: {
        sw: 'Chanjo ya pili ya tetanus',
        en: 'Second tetanus vaccination',
      },
      completed: false,
    },
  ];

  // Mock child data
  const childData: ChildData = {
    name: 'Amani',
    birthDate: new Date('2025-08-15'),
    ageMonths: 6,
    immunizations: [
      {
        name: { sw: 'BCG', en: 'BCG' },
        dueDate: new Date('2025-08-15'),
        completed: true,
      },
      {
        name: { sw: 'Polio 1', en: 'Polio 1' },
        dueDate: new Date('2025-08-15'),
        completed: true,
      },
      {
        name: { sw: 'Polio 2', en: 'Polio 2' },
        dueDate: new Date('2025-09-15'),
        completed: true,
      },
      {
        name: { sw: 'Polio 3', en: 'Polio 3' },
        dueDate: new Date('2025-10-15'),
        completed: true,
      },
      {
        name: { sw: 'Surua (Measles)', en: 'Measles' },
        dueDate: new Date('2026-02-15'),
        completed: false,
      },
    ],
    growth: [
      { weight: 3.2, height: 50, date: new Date('2025-08-15') },
      { weight: 4.5, height: 55, date: new Date('2025-09-15') },
      { weight: 5.8, height: 60, date: new Date('2025-11-15') },
      { weight: 6.9, height: 65, date: new Date('2026-01-15') },
    ],
  };

  const getRiskColor = (level: string) => {
    switch (level) {
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Pregnancy Overview
  if (mode === 'pregnancy') {
    const riskColors = getRiskColor(pregnancyData.riskLevel);
    const weeksLeft = Math.round((pregnancyData.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7));
    const progress = (pregnancyData.weekNumber / 40) * 100;

    return (
      <div className="min-h-screen bg-[#FAFBFC] pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#EC4899] to-[#DB2777] text-white">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-4 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                {language === 'sw' ? 'Rudi' : 'Back'}
              </span>
            </button>

            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8" />
              <h1 className="text-3xl font-bold">{t.title}</h1>
            </div>
            <p className="text-white/90 text-base">{t.subtitle}</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('pregnancy')}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors bg-[#EC4899] text-white"
              >
                {t.tabs.pregnancy}
              </button>
              <button
                onClick={() => setMode('child')}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
              >
                {t.tabs.child}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* Current Week Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#EC4899] to-[#DB2777] rounded-2xl p-6 text-white"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm mb-1">{t.currentWeek}</p>
                <h2 className="text-5xl font-bold">{pregnancyData.weekNumber}</h2>
                <p className="text-white/90 mt-2">
                  {weeksLeft} {language === 'sw' ? 'wiki zimebaki' : 'weeks left'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm mb-1">{t.dueDate}</p>
                <p className="text-lg font-semibold">
                  {formatDate(pregnancyData.dueDate)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="bg-white h-full rounded-full"
              />
            </div>
          </motion.div>

          {/* Risk & Next Appointment */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-5 rounded-xl border"
              style={{
                backgroundColor: riskColors.bg,
                borderColor: riskColors.border,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity
                  className="w-5 h-5"
                  style={{ color: riskColors.text }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: riskColors.text }}
                >
                  {t.riskLevel}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: riskColors.text }}>
                {t.riskLevels[pregnancyData.riskLevel]}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-[#1E88E5]" />
                <span className="text-sm font-medium text-[#1E88E5]">
                  {t.nextAppointment}
                </span>
              </div>
              <p className="text-lg font-bold text-[#1A1D23]">
                {formatDate(pregnancyData.nextCheckup)}
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                {getDaysUntil(pregnancyData.nextCheckup)}{' '}
                {language === 'sw' ? 'siku' : 'days'}
              </p>
            </div>
          </div>

          {/* This Week Info */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="text-lg font-semibold text-[#1A1D23] mb-4">
              {t.thisWeek}
            </h3>

            {/* Baby Development */}
            <div className="mb-4 p-4 bg-[#FDF2F8] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Baby className="w-5 h-5 text-[#EC4899]" />
                <h4 className="text-sm font-semibold text-[#1A1D23]">
                  {t.babyDevelopment}
                </h4>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {language === 'sw'
                  ? 'Mtoto wako ni karibu kg 0.6 na urefu wa cm 30. Anaweza kusikia sauti zako!'
                  : 'Your baby is about 0.6 kg and 30 cm long. They can hear your voice!'}
              </p>
            </div>

            {/* Mother Health */}
            <div className="mb-4 p-4 bg-[#EFF6FF] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-[#1E88E5]" />
                <h4 className="text-sm font-semibold text-[#1A1D23]">
                  {t.motherHealth}
                </h4>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {language === 'sw'
                  ? 'Unaweza kuhisi mtoto akisogea. Kula vyakula vyenye virutubishi vingi.'
                  : 'You might feel baby movements. Eat nutrient-rich foods.'}
              </p>
            </div>

            {/* Tips */}
            <div className="p-4 bg-[#ECFDF5] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                <h4 className="text-sm font-semibold text-[#1A1D23]">
                  {t.tipsThisWeek}
                </h4>
              </div>
              <ul className="space-y-1 text-sm text-[#6B7280]">
                <li>• {language === 'sw' ? 'Kunywa maji mengi' : 'Drink plenty of water'}</li>
                <li>• {language === 'sw' ? 'Pumzika vizuri' : 'Get adequate rest'}</li>
                <li>
                  •{' '}
                  {language === 'sw'
                    ? 'Mazoezi ya upole'
                    : 'Gentle exercise like walking'}
                </li>
              </ul>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1A1D23]">{t.milestones}</h3>
              <button className="text-sm font-medium text-[#1E88E5]">
                {t.viewAllMilestones}
              </button>
            </div>
            <div className="space-y-3">
              {milestones.slice(0, 3).map((milestone, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-[#FAFBFC] rounded-lg"
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      milestone.completed
                        ? 'bg-[#10B981]'
                        : 'bg-[#E5E7EB]'
                    }`}
                  >
                    {milestone.completed ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-sm font-bold text-[#6B7280]">
                        {milestone.week}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1A1D23]">
                      {milestone.title[language]}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {milestone.description[language]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Signs */}
          <div className="bg-[#FEF2F2] rounded-xl border border-[#FEE2E2] p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-[#EF4444] flex-shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-[#991B1B] mb-2">
                  {t.warningSignsTitle}
                </h3>
                <ul className="space-y-1.5 text-sm text-[#991B1B]">
                  {t.warningSigns.map((sign, idx) => (
                    <li key={idx}>• {sign}</li>
                  ))}
                </ul>
                <p className="text-sm text-[#991B1B] mt-3 font-medium">
                  {t.emergencyContact}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onNavigate('appointments')}
              className="h-14 bg-[#EC4899] hover:bg-[#DB2777]"
            >
              <Calendar className="w-5 h-5 mr-2" />
              {t.bookCheckup}
            </Button>
            <Button
              onClick={() => onNavigate('messages')}
              variant="outline"
              className="h-14"
            >
              <Phone className="w-5 h-5 mr-2" />
              {t.contactCHW}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Child Care Mode
  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#EC4899] to-[#DB2777] text-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-4 text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">
              {language === 'sw' ? 'Rudi' : 'Back'}
            </span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Baby className="w-8 h-8" />
            <h1 className="text-3xl font-bold">{t.title}</h1>
          </div>
          <p className="text-white/90 text-base">{t.subtitle}</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('pregnancy')}
              className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
            >
              {t.tabs.pregnancy}
            </button>
            <button
              onClick={() => setMode('child')}
              className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors bg-[#EC4899] text-white"
            >
              {t.tabs.child}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Child Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#EC4899] to-[#DB2777] rounded-2xl p-6 text-white"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">{t.childName}</p>
              <h2 className="text-3xl font-bold mb-2">{childData.name}</h2>
              <p className="text-white/90">
                {childData.ageMonths} {t.months}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Baby className="w-8 h-8" />
            </div>
          </div>
        </motion.div>

        {/* Immunizations */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#1A1D23] mb-4">
            {t.immunizations}
          </h3>
          <div className="space-y-3">
            {childData.immunizations.map((imm, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  imm.completed
                    ? 'bg-[#ECFDF5] border border-[#A7F3D0]'
                    : 'bg-[#FFFBEB] border border-[#FDE68A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {imm.completed ? (
                    <CheckCircle className="w-6 h-6 text-[#10B981]" />
                  ) : (
                    <Clock className="w-6 h-6 text-[#F59E0B]" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[#1A1D23]">
                      {imm.name[language]}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {formatDate(imm.dueDate)}
                    </p>
                  </div>
                </div>
                {imm.completed ? (
                  <span className="text-xs font-medium text-[#10B981]">
                    {t.completed}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-[#F59E0B]">
                    {t.pending}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Growth Chart (Simplified) */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#1A1D23] mb-4">{t.growth}</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[#EFF6FF] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6B7280]">
                  {language === 'sw' ? 'Uzito wa Sasa' : 'Current Weight'}
                </span>
                <span className="text-2xl font-bold text-[#1E88E5]">
                  {childData.growth[childData.growth.length - 1].weight} kg
                </span>
              </div>
            </div>
            <div className="p-4 bg-[#ECFDF5] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6B7280]">
                  {language === 'sw' ? 'Urefu wa Sasa' : 'Current Height'}
                </span>
                <span className="text-2xl font-bold text-[#10B981]">
                  {childData.growth[childData.growth.length - 1].height} cm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onNavigate('appointments')}
            className="h-14 bg-[#EC4899] hover:bg-[#DB2777]"
          >
            <Calendar className="w-5 h-5 mr-2" />
            {t.bookCheckup}
          </Button>
          <Button onClick={() => onNavigate('messages')} variant="outline" className="h-14">
            <Phone className="w-5 h-5 mr-2" />
            {t.contactCHW}
          </Button>
        </div>
      </div>
    </div>
  );
}
