import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  ChevronRight,
  Route,
  User,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/app/store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { AutonomousDispatchEngine, DispatchTask } from '../services/AutonomousDispatchEngine';

const translations = {
  sw: {
    title: 'Ratibu Ziara',
    subtitle: 'Panga ziara zako kwa ufanisi',
    todayRoute: 'Njia ya Leo',
    optimize: 'Boresha Njia',
    startRoute: 'Anza Ziara',
    totalDistance: 'Umbali Jumla',
    estimatedTime: 'Muda Uliokadiriwa',
    visits: 'Ziara',
    urgent: 'Dharura',
    routine: 'Kawaida',
    visitOrder: 'Mpangilio wa Ziara',
    patient: 'Mgonjwa',
    reason: 'Sababu',
    priority: 'Kipaumbele',
    completed: 'Imekamilika',
    pending: 'Inasubiri',
    markComplete: 'Weka Imekamilika',
    navigate: 'Elekeza',
    optimized: 'Imeboreshwa',
    manual: 'Wewe Mwenyewe',
  },
  en: {
    title: 'Route Planner',
    subtitle: 'Plan your visits efficiently',
    todayRoute: "Today's Route",
    optimize: 'Optimize Route',
    startRoute: 'Start Route',
    totalDistance: 'Total Distance',
    estimatedTime: 'Estimated Time',
    visits: 'Visits',
    urgent: 'Urgent',
    routine: 'Routine',
    visitOrder: 'Visit Order',
    patient: 'Patient',
    reason: 'Reason',
    priority: 'Priority',
    completed: 'Completed',
    pending: 'Pending',
    markComplete: 'Mark Complete',
    navigate: 'Navigate',
    optimized: 'Optimized',
    manual: 'Manual',
  },
};

export function CHWRouteOptimizer({ onBack }: { onBack: () => void }) {
  const { language } = useAppStore();
  const t = translations[language];
  const [routeMode, setRouteMode] = useState<'optimized' | 'manual'>('optimized');
  
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

  const urgentVisits = liveTasks.filter((v) => v.triage_level === 'urgent' || v.triage_level === 'emergency');
  
  // Fake stats based on live tasks for demo purposes
  const totalDistance = liveTasks.length * 1.5; 
  const totalTime = liveTasks.length * 20;

  const optimizeRoute = () => {
    const optimized = [...liveTasks].sort((a, b) => {
      const aIsUrgent = a.triage_level === 'urgent' || a.triage_level === 'emergency';
      const bIsUrgent = b.triage_level === 'urgent' || b.triage_level === 'emergency';
      if (aIsUrgent && !bIsUrgent) return -1;
      if (!aIsUrgent && bIsUrgent) return 1;
      return 0;
    });
    setLiveTasks(optimized);
    setRouteMode('optimized');
  };

  const markComplete = (id: string) => {
    // Usually we would update DB here
    setLiveTasks((prev) => prev.filter(v => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span className="text-sm font-medium">{language === 'sw' ? 'Rudi' : 'Back'}</span>
          </button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
            <Route className="w-8 h-8 text-blue-600" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">{liveTasks.length}</p>
              <p className="text-xs text-blue-600">{t.visits}</p>
            </div>

            <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
              <p className="text-2xl font-bold text-orange-700">{urgentVisits.length}</p>
              <p className="text-xs text-orange-600">{t.urgent}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <p className="text-2xl font-bold text-green-700">{totalDistance.toFixed(1)}</p>
              <p className="text-xs text-green-600">km</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="flex gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={optimizeRoute}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-200"
          >
            <Zap className="w-5 h-5" />
            {t.optimize}
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-green-200">
            <Navigation className="w-5 h-5" />
            {t.startRoute}
          </motion.button>
        </div>

        {/* Route Mode Badge */}
        {routeMode === 'optimized' && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {language === 'sw'
                ? 'Njia imeboreshwa na AI kwa haraka na ufanisi'
                : 'Route optimized by AI for speed and efficiency'}
            </span>
          </div>
        )}

        {/* Visit List */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t.visitOrder}</h2>
        <div className="space-y-4">
          {loading ? (
             <div className="p-6 text-center text-gray-500">Loading AI Dispatch Tasks...</div>
          ) : liveTasks.length === 0 ? (
             <div className="p-6 text-center text-gray-500">No pending dispatch tasks.</div>
          ) : (
            <AnimatePresence>
              {liveTasks.map((visit, index) => (
                <motion.div
                  key={visit.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  transition={{ delay: index * 0.1, layout: { duration: 0.3 } }}
                  className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden"
                >
                {/* Status bar */}
                <div
                  className={`h-2 w-full ${
                    visit.triage_level === 'emergency' || visit.triage_level === 'urgent' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                />

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{visit.patient_name}</h3>
                        <p className="text-sm text-gray-500">{visit.patient_phone}</p>
                      </div>
                    </div>
                    {visit.triage_level === 'urgent' && (
                      <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {t.urgent}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase mb-0.5">{t.reason}</p>
                        <p className="text-sm text-gray-900">{visit.reasoning}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => markComplete(visit.id)}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-gray-200 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t.markComplete}
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-blue-200 shadow-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      {t.navigate}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
