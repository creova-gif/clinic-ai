import React, { useState, useEffect } from 'react';
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
import { useAppStore } from '@/app/store/useAppStore';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { OfflineBanner } from '@/app/components/ui/OfflineBanner';
import { AnimatedButton } from '@/app/components/ui/AnimatedButton';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { AutonomousDispatchEngine, DispatchTask } from '../services/AutonomousDispatchEngine';

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
  const { language } = useAppStore();
  const t = translations[language];
  const [liveTasks, setLiveTasks] = useState<DispatchTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hardcoded to seeded CHW for demo
    const MY_CHW_ID = '11111111-1111-1111-1111-111111111111';
    AutonomousDispatchEngine.getTasksForCHW(MY_CHW_ID).then(tasks => {
      setLiveTasks(tasks);
      setLoading(false);
    });
  }, []);

  const stats = {
    totalHouseholds: 145,
    visitedToday: 8,
    targetToday: 12,
    highRisk: liveTasks.filter(t => t.triage_level === 'urgent' || t.triage_level === 'emergency').length,
    referrals: 3,
  };

  const getRiskBorderClass = (risk: string) => {
    switch (risk) {
      case 'critical': return 'border-l-[4px] border-l-[#ef4444]';
      case 'high': return 'border-l-[4px] border-l-[#f97316]';
      case 'medium': return 'border-l-[4px] border-l-[#eab308]';
      default: return 'border-l-[4px] border-l-[#10b981]';
    }
  };

  return (
    <main role="main" className="min-h-screen bg-[#f8fafc] pb-20">
      <OfflineBanner />
      
      <HeroHeader 
        title={t.title}
        subtitle={`${t.visits}: ${stats.visitedToday} / ${stats.targetToday}`}
        icon={<Users className="w-6 h-6 text-white" />}
        action={
          <button
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={t.back}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: <Home className="h-5 w-5 text-[#0d9488]" />, value: '156', label: t.households },
            { icon: <Calendar className="h-5 w-5 text-[#10b981]" />, value: '8', label: t.visits, valueClass: 'text-[#10b981]' },
            { icon: <AlertTriangle className="h-5 w-5 text-[#ef4444]" />, value: stats.highRisk.toString(), label: t.highRisk, valueClass: 'text-[#ef4444]' },
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
            <StatusBadge variant="danger" label={`${liveTasks.length} ${t.urgentPatients}`} />
          </div>
          <p className="text-sm text-gray-500 px-5 py-2 border-b border-gray-100">{t.aiRecommends}</p>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-5 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-5 bg-gray-100 rounded-full w-16"></div>
                    </div>
                    <div className="h-16 bg-gray-100 rounded-lg mb-3 w-full"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : liveTasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No pending dispatch tasks.</div>
            ) : (
              liveTasks.map((task, idx) => {
                const isCritical = task.triage_level === 'emergency' || task.triage_level === 'urgent';
                return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    boxShadow: isCritical ? [
                      "inset 4px 0 0 #ef4444, 0px 0px 0px rgba(239, 68, 68, 0)",
                      "inset 4px 0 0 #ef4444, 0px 0px 20px rgba(239, 68, 68, 0.2)",
                      "inset 4px 0 0 #ef4444, 0px 0px 0px rgba(239, 68, 68, 0)"
                    ] : "inset 4px 0 0 #f97316, 0 2px 10px rgba(0,0,0,0.02)"
                  }}
                  transition={{ 
                    opacity: { delay: idx * 0.07 },
                    y: { delay: idx * 0.07 },
                    boxShadow: isCritical ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}
                  }}
                  className="p-5 hover:bg-gray-50 bg-white relative z-10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-[#0f172a]">{task.patient_name}</h3>
                        <StatusBadge
                          variant={task.triage_level === 'emergency' || task.triage_level === 'urgent' ? 'danger' : 'warning'}
                          label={task.triage_level.toUpperCase()}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        {task.patient_phone}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#ccfbf1] border-l-[4px] border-l-[#0d9488] p-3 rounded mb-3">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-[#0d9488] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-[#0f172a] uppercase mb-1">{t.aiRecommends}</p>
                        <p className="text-sm text-[#3730a3]">{task.reasoning}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 min-h-[48px]">
                    <AnimatedButton
                      type="button"
                      aria-label={t.markVisited}
                      size="sm"
                      variant="primary"
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t.markVisited}
                    </AnimatedButton>
                    <AnimatedButton
                      type="button"
                      aria-label={t.callPatient}
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => (window.location.href = `tel:${task.patient_phone}`)}
                    >
                      <Clock className="w-4 h-4" />
                      {t.callPatient}
                    </AnimatedButton>
                  </div>
                </motion.div>
                );
              })
            )}
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
            <div className="flex justify-center my-6 relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-gray-100"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={351.86}
                  initial={{ strokeDashoffset: 351.86 }}
                  animate={{ strokeDashoffset: 351.86 - (351.86 * 92) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-[#0d9488]"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-[#0f172a]">92%</span>
                <span className="text-xs text-gray-500">Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
