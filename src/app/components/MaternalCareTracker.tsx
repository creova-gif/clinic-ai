import React from 'react';
import { ChevronLeft, Baby, Calendar, TrendingUp, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { useAppStore } from '@/app/store/useAppStore';

const translations = {
  sw: {
    title: 'Mama & Mtoto',
    weekProgress: 'Wiki ya Ujauzito',
    weeks: 'wiki',
    dueDate: 'Tarehe ya Kujifungua',
    nextANC: 'ANC Ijayo',
    ancVisits: 'Ziara za ANC',
    completed: 'Zimekamilika',
    of: 'kati ya',
    healthTips: 'Ushauri wa Afya',
    redFlags: 'Dalili za Hatari',
    babySize: 'Ukubwa wa Mtoto',
    weight: 'Uzito Wako',
    bloodPressure: 'Shinikizo la Damu',
    normal: 'Kawaida',
    callMidwife: 'Piga Simu Mkunga',
    emergency: 'Dharura: 112',
    viewFullHistory: 'Angalia Historia Yote',
    symptoms: 'Dalili',
    none: 'Hakuna',
  },
  en: {
    title: 'Maternal & Child',
    weekProgress: 'Pregnancy Week',
    weeks: 'weeks',
    dueDate: 'Due Date',
    nextANC: 'Next ANC',
    ancVisits: 'ANC Visits',
    completed: 'Completed',
    of: 'of',
    healthTips: 'Health Tips',
    redFlags: 'Warning Signs',
    babySize: 'Baby Size',
    weight: 'Your Weight',
    bloodPressure: 'Blood Pressure',
    normal: 'Normal',
    callMidwife: 'Call Midwife',
    emergency: 'Emergency: 112',
    viewFullHistory: 'View Full History',
    symptoms: 'Symptoms',
    none: 'None',
  },
};

interface MaternalCareTrackerProps {
  onBack: () => void;
}

export function MaternalCareTracker({ onBack }: MaternalCareTrackerProps) {
  const { language } = useAppStore();
  const t = translations[language];

  // Mock data
  const pregnancyData = {
    currentWeek: 24,
    totalWeeks: 40,
    dueDate: language === 'sw' ? '15 Julai, 2026' : 'July 15, 2026',
    nextANC: language === 'sw' ? 'Jumatatu, Jan 27' : 'Monday, Jan 27',
    ancCompleted: 3,
    ancTotal: 8,
    weight: '68 kg',
    bloodPressure: '118/76',
    babySize: language === 'sw' ? 'Ukubwa wa ndizi' : 'Size of a banana',
  };

  const progress = (pregnancyData.currentWeek / pregnancyData.totalWeeks) * 100;
  const ancProgress = (pregnancyData.ancCompleted / pregnancyData.ancTotal) * 100;

  const healthTips = [
    {
      id: 1,
      text:
        language === 'sw'
          ? 'Nywa maji mengi - angalau mita 8-10 kwa siku'
          : 'Drink plenty of water - at least 8-10 glasses per day',
      icon: '💧',
    },
    {
      id: 2,
      text:
        language === 'sw'
          ? 'Kula chakula chenye virutubishi - matunda, mboga, protini'
          : 'Eat nutritious foods - fruits, vegetables, protein',
      icon: '🥗',
    },
    {
      id: 3,
      text:
        language === 'sw'
          ? 'Pumzika vizuri - angalau masaa 8 kwa usiku'
          : 'Rest well - at least 8 hours per night',
      icon: '😴',
    },
  ];

  const redFlags = [
    {
      id: 1,
      text: language === 'sw' ? 'Kuvuja damu' : 'Bleeding',
      hasSymptom: false,
    },
    {
      id: 2,
      text: language === 'sw' ? 'Maumivu makali ya tumbo' : 'Severe abdominal pain',
      hasSymptom: false,
    },
    {
      id: 3,
      text: language === 'sw' ? 'Kichwa kizunguzungu' : 'Severe headache',
      hasSymptom: false,
    },
    {
      id: 4,
      text: language === 'sw' ? 'Vimbe vya miguu na uso' : 'Swelling of feet and face',
      hasSymptom: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <Baby className="h-7 w-7 text-pink-600" />
            <h1 className="text-2xl font-semibold text-gray-900">{t.title}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Pregnancy Progress Ring */}
        <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm text-gray-600 mb-1">{t.weekProgress}</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-pink-600">
                    {pregnancyData.currentWeek}
                  </span>
                  <span className="text-lg text-gray-500">/ {pregnancyData.totalWeeks} {t.weeks}</span>
                </div>
              </div>
              <div className="relative h-24 w-24">
                {/* Simple circular progress */}
                <svg className="transform -rotate-90 h-24 w-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#FDE2E4"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#EC4899"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${progress * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-pink-600">{Math.round(progress)}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-pink-600" />
                  <p className="text-xs text-gray-500">{t.dueDate}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{pregnancyData.dueDate}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-pink-600" />
                  <p className="text-xs text-gray-500">{t.nextANC}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{pregnancyData.nextANC}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ANC Progress */}
        <Card className="border border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{t.ancVisits}</h3>
              <span className="text-sm font-medium text-gray-600">
                {pregnancyData.ancCompleted} {t.of} {pregnancyData.ancTotal} {t.completed}
              </span>
            </div>
            <Progress value={ancProgress} className="h-3 mb-2" />
            <p className="text-xs text-gray-500">
              {language === 'sw'
                ? `Ziara ${pregnancyData.ancTotal - pregnancyData.ancCompleted} zimebaki`
                : `${pregnancyData.ancTotal - pregnancyData.ancCompleted} visits remaining`}
            </p>
          </CardContent>
        </Card>

        {/* Health Vitals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">{t.babySize}</p>
              <p className="text-2xl mb-1">🍌</p>
              <p className="text-sm font-medium text-gray-900">{pregnancyData.babySize}</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">{t.weight}</p>
              <p className="text-2xl mb-1">⚖️</p>
              <p className="text-sm font-medium text-gray-900">{pregnancyData.weight}</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">{t.bloodPressure}</p>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-lg font-semibold text-gray-900">{pregnancyData.bloodPressure}</p>
                <Badge className="bg-green-100 text-green-700 text-xs border-0">{t.normal}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Tips */}
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">{t.healthTips}</h3>
            </div>
            <ul className="space-y-2">
              {healthTips.map((tip) => (
                <li key={tip.id} className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="text-base flex-shrink-0">{tip.icon}</span>
                  <span>{tip.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Red Flags Warning */}
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">{t.redFlags}</h3>
            </div>
            <p className="text-sm text-amber-800 mb-3">
              {language === 'sw'
                ? 'Piga simu MARA MOJA ukiona dalili hizi:'
                : 'Call IMMEDIATELY if you experience any of these:'}
            </p>
            <div className="space-y-2">
              {redFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between p-2 bg-white rounded-lg"
                >
                  <span className="text-sm text-gray-900">{flag.text}</span>
                  {flag.hasSymptom ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="py-4 px-6 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all">
            <Phone className="h-5 w-5" />
            <span className="font-semibold">{t.callMidwife}</span>
          </button>
          <button
            onClick={() => (window.location.href = 'tel:112')}
            className="py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all"
          >
            <Phone className="h-5 w-5" />
            <span className="font-semibold">{t.emergency}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
