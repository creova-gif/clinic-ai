import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Home,
  TrendingUp,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ArrowLeft,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';
import { useApp } from '@/app/context/AppContext';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { OfflineBanner } from '@/app/components/ui/OfflineBanner';
import { AnimatedButton } from '@/app/components/ui/AnimatedButton';
import { StatusBadge } from '@/app/components/ui/StatusBadge';

const translations = {
  sw: {
    title: 'Dashibodi ya CHW',
    households: 'Kaya',
    visits: 'Ziara Leo',
    highRisk: 'Hatari Kubwa',
    referrals: 'Marejesho',
    aiPriority: 'Kipaumbele cha AI',
    visitToday: 'Tembelea Leo',
    overdue: 'Umechelewa',
    pregnant: 'Wajawazito',
    children: 'Watoto',
    ncds: 'Magonjwa Sugu',
    coverage: 'Ufikaji',
    performance: 'Utendaji',
    back: 'Rudi',
    urgentAction: 'Hatua za Haraka',
    aiRecommends: 'AI Inapendekeza',
    urgentPatients: 'Wagonjwa wa Haraka',
    actionNeeded: 'Hatua Inahitajika',
    lastVisit: 'Ziara ya Mwisho',
    riskScore: 'Hatari',
    daysOverdue: 'Siku Zilizopita',
    viewDetails: 'Angalia Maelezo',
    markVisited: 'Weka Ametembelewa',
    callPatient: 'Piga Simu',
    planRoute: 'Ratibu Ziara',
    planRouteDesc: 'Panga njia bora ya kutembelea',
  },
  en: {
    title: 'CHW Dashboard',
    households: 'Households',
    visits: 'Visits Today',
    highRisk: 'High Risk',
    referrals: 'Referrals',
    aiPriority: 'AI Priority',
    visitToday: 'Visit Today',
    overdue: 'Overdue',
    pregnant: 'Pregnant Women',
    children: 'Children',
    ncds: 'Chronic Diseases',
    coverage: 'Coverage',
    performance: 'Performance',
    back: 'Back',
    urgentAction: 'Urgent Action Required',
    aiRecommends: 'AI Recommends',
    urgentPatients: 'Urgent Patients',
    actionNeeded: 'Action Needed',
    lastVisit: 'Last Visit',
    riskScore: 'Risk',
    daysOverdue: 'Days Overdue',
    viewDetails: 'View Details',
    markVisited: 'Mark Visited',
    callPatient: 'Call Patient',
    planRoute: 'Plan Route',
    planRouteDesc: 'Optimize your visit schedule',
  },
};

interface CHWDashboardProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export function CHWDashboard({ onBack, onNavigate }: CHWDashboardProps) {
  const { language } = useApp();
  const t = translations[language];

  const priorityHouseholds = [
    {
      id: '1',
      name: 'Mama Fatuma Hassan',
      age: 28,
      status: 'pregnant',
      risk: 'critical',
      riskScore: 92,
      reason: language === 'sw' ? 'Mimba - homa kwa siku 3' : 'Pregnancy - fever for 3 days',
      aiAction: language === 'sw'
        ? 'Rejesha kwa kliniki SASA - homa wakati wa ujauzito ni hatari'
        : 'Refer to clinic NOW - fever during pregnancy is dangerous',
      lastVisit: '5 days ago',
      daysOverdue: 5,
      phone: '+255 741 234 567',
      nextAction: language === 'sw' ? 'Rejesha Kliniki' : 'Refer to Clinic',
    },
    {
      id: '2',
      name: 'Halima Saleh',
      age: 2,
      status: 'child',
      risk: 'critical',
      riskScore: 88,
      reason: language === 'sw' ? 'Mtoto (2 years) - kuhara na kutapika' : 'Child (2 years) - diarrhea and vomiting',
      aiAction: language === 'sw'
        ? 'Tembelea LEO - hatari ya ukosefu wa maji kwa watoto'
        : 'Visit TODAY - risk of dehydration in children',
      lastVisit: '1 day ago',
      daysOverdue: 1,
      phone: '+255 742 345 678',
      nextAction: language === 'sw' ? 'Tembelea Leo' : 'Visit Today',
    },
    {
      id: '3',
      name: 'Juma Ramadhani',
      age: 56,
      status: 'ncd',
      risk: 'high',
      riskScore: 75,
      reason: language === 'sw' ? 'Shinikizo la damu - dawa zimekwisha' : 'Hypertension - medication finished',
      aiAction: language === 'sw'
        ? 'Leta dawa mpya wiki hii - shinikizo lisilo na dawa ni hatari'
        : 'Deliver new medication this week - uncontrolled BP is risky',
      lastVisit: '2 weeks ago',
      daysOverdue: 7,
      phone: '+255 743 456 789',
      nextAction: language === 'sw' ? 'Leta Dawa' : 'Deliver Medication',
    },
    {
      id: '4',
      name: 'Grace Mwakasege',
      age: 31,
      status: 'pregnant',
      risk: 'medium',
      riskScore: 58,
      reason: language === 'sw' ? 'Mimba - kliniki ya ANC ya 4' : 'Pregnancy - 4th ANC visit due',
      aiAction: language === 'sw'
        ? 'Tathmini ya kawaida - hakikisha ANC inafuatiliwa'
        : 'Routine assessment - ensure ANC follow-up',
      lastVisit: '3 weeks ago',
      daysOverdue: 2,
      phone: '+255 744 567 890',
      nextAction: language === 'sw' ? 'ANC Kufuatilia' : 'ANC Follow-up',
    },
  ];

  const sortedPriorities = [...priorityHouseholds].sort((a, b) => b.riskScore - a.riskScore);

  const getRiskBorderClass = (risk: string) => {
    switch (risk) {
      case 'critical': return 'border-l-[4px] border-l-[#ef4444]';
      case 'high': return 'border-l-[4px] border-l-[#f97316]';
      case 'medium': return 'border-l-[4px] border-l-[#f59e0b]';
      default: return 'border-l-[4px] border-l-[#10b981]';
    }
  };

  const getRiskBadgeVariant = (risk: string): 'danger' | 'warning' | 'normal' => {
    switch (risk) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      default: return 'normal';
    }
  };

  const getRiskLabel = (risk: string, score: number) => {
    switch (risk) {
      case 'critical': return `${language === 'sw' ? 'Hatari Kubwa' : 'Critical'} ${score}`;
      case 'high': return `${language === 'sw' ? 'Juu' : 'High'} ${score}`;
      case 'medium': return `${language === 'sw' ? 'Wastani' : 'Medium'} ${score}`;
      default: return `${language === 'sw' ? 'Chini' : 'Low'} ${score}`;
    }
  };

  return (
    <main role="main" className="min-h-screen bg-[#f8fafc] pb-20">
      <OfflineBanner />
      <HeroHeader greeting="Dawa za Jamii" />

      <div className="max-w-7xl mx-auto px-4 py-4">
        <AnimatedButton
          type="button"
          aria-label={t.back}
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.back}
        </AnimatedButton>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Home className="h-5 w-5 text-[#0d9488]" />, value: '156', label: t.households },
            { icon: <Calendar className="h-5 w-5 text-[#10b981]" />, value: '8', label: t.visits, valueClass: 'text-[#10b981]' },
            { icon: <AlertTriangle className="h-5 w-5 text-[#ef4444]" />, value: '12', label: t.highRisk, valueClass: 'text-[#ef4444]' },
            { icon: <TrendingUp className="h-5 w-5 text-[#f97316]" />, value: '5', label: t.referrals, valueClass: 'text-[#f97316]' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4"
            >
              <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
                {stat.icon}
                <span>{stat.label}</span>
              </div>
              <div className={`text-3xl font-bold ${stat.valueClass ?? 'text-[#0f172a]'}`}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Route Optimizer CTA */}
        {onNavigate && (
          <AnimatedButton
            type="button"
            aria-label={t.planRoute}
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => onNavigate('route-optimizer')}
            className="mb-6 p-6 rounded-2xl justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <MapPin className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-1">{t.planRoute}</h3>
                <p className="text-sm text-white/80">{t.planRouteDesc}</p>
              </div>
            </div>
            <ArrowLeft className="h-6 w-6 text-white/60 rotate-180" />
          </AnimatedButton>
        )}

        {/* AI Priority List */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-6 border-l-[4px] border-l-[#ef4444] overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-[#ef4444]" />
              <h2 className="text-xl font-semibold text-[#0f172a]">{t.urgentAction}</h2>
            </div>
            <StatusBadge variant="danger" label={`${sortedPriorities.length} ${t.urgentPatients}`} />
          </div>
          <p className="text-sm text-gray-500 px-5 py-2 border-b border-gray-100">{t.aiRecommends}</p>

          <div className="divide-y divide-gray-100">
            {sortedPriorities.map((household, idx) => (
              <motion.div
                key={household.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                className={`p-5 hover:bg-gray-50 transition-colors bg-white ${getRiskBorderClass(household.risk)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-[#0f172a]">{household.name}</h3>
                      <StatusBadge
                        variant={getRiskBadgeVariant(household.risk)}
                        label={getRiskLabel(household.risk, household.riskScore)}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {household.age} {language === 'sw' ? 'miaka' : 'years old'} • {household.status}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border-l-[4px] border-l-[#0d9488] p-3 rounded mb-3">
                  <p className="text-sm font-medium text-gray-900">{household.reason}</p>
                </div>

                <div className="bg-[#ccfbf1] border-l-[4px] border-l-[#0d9488] p-3 rounded mb-3">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-[#0d9488] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#0f172a] uppercase mb-1">{t.aiRecommends}</p>
                      <p className="text-sm text-[#3730a3]">{household.aiAction}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.lastVisit}: {household.lastVisit}</span>
                  </div>
                  {household.daysOverdue > 0 && (
                    <StatusBadge variant="warning" label={`${household.daysOverdue} ${t.daysOverdue}`} />
                  )}
                </div>

                <div className="flex gap-2 min-h-[48px]">
                  <AnimatedButton
                    type="button"
                    aria-label={household.nextAction}
                    size="sm"
                    variant="primary"
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {household.nextAction}
                  </AnimatedButton>
                  <AnimatedButton
                    type="button"
                    aria-label={t.callPatient}
                    size="sm"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => (window.location.href = `tel:${household.phone}`)}
                  >
                    <Clock className="w-4 h-4" />
                    {t.callPatient}
                  </AnimatedButton>
                  {onNavigate && (
                    <AnimatedButton
                      type="button"
                      aria-label={t.planRoute}
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => onNavigate(`route/${household.id}`)}
                    >
                      <MapPin className="w-4 h-4" />
                      {t.planRoute}
                    </AnimatedButton>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-center gap-2 mb-4 text-[#0f172a] font-semibold">
              <MapPin className="h-5 w-5 text-[#10b981]" />
              {t.coverage}
            </div>
            <div className="space-y-4">
              {[
                { label: t.pregnant, value: 85 },
                { label: `${t.children} <5`, value: 92 },
                { label: t.ncds, value: 78 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-semibold text-[#0f172a]">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-center gap-2 mb-4 text-[#0f172a] font-semibold">
              <TrendingUp className="h-5 w-5 text-[#0d9488]" />
              {t.performance}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-gray-700">{language === 'sw' ? 'Ziara Wiki Hii' : 'Visits This Week'}</span>
                <StatusBadge variant="success" label="42" />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#ccfbf1] rounded-xl">
                <span className="text-sm text-gray-700">{language === 'sw' ? 'Marejesho Yaliyofanikiwa' : 'Successful Referrals'}</span>
                <StatusBadge variant="info" label="38" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-gray-700">{language === 'sw' ? 'Data Iliyopokelewa' : 'Data Synced'}</span>
                <CheckCircle className="h-5 w-5 text-[#10b981]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
