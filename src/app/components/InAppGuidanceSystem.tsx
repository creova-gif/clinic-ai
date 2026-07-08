import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  ChevronRight,
  Info,
  Lightbulb,
  CheckCircle,
  Search,
  Book,
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { useAppStore } from '@/app/store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';

interface InAppGuidanceSystemProps {
  enabled?: boolean;
}

interface GuidanceContent {
  id: string;
  type: 'walkthrough' | 'tooltip' | 'smart-tip' | 'task-list';
  trigger: string; // Page or element ID
  title: string;
  content: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  actions?: { label: string; action: () => void }[];
  dismissable: boolean;
  priority: number;
}

const translations = {
  sw: {
    help: 'Msaada',
    searchHelp: 'Tafuta msaada...',
    close: 'Funga',
    next: 'Ifuatayo',
    previous: 'Iliyopita',
    gotIt: 'Nimeelewa',
    learnMore: 'Jifunze zaidi',
    skip: 'Ruka',
    showMeHow: 'Nionyeshe jinsi',
    quickTips: 'Vidokezo vya Haraka',
    helpCenter: 'Kituo cha Msaada',
    tutorials: 'Mafunzo',
    faq: 'Maswali Yanayoulizwa Mara kwa Mara',
    contactSupport: 'Wasiliana na Msaada',
    tipOfTheDay: 'Kidokezo cha Leo',
    helpfulResources: 'Rasilimali za Msaada',
    
    // Common guidance content
    appointmentHelp: 'Gusa "Miadi" ili kutenga, kubadilisha, au kughairi miadi yako.',
    symptomsHelp: 'Tumia "Angalia Dalili" kupata mapendekezo ya mara moja ya AI.',
    resultsHelp: 'Matokeo yako ya maabara yatapatikana hapa 24 masaa baada ya upimaji.',
    nhifHelp: 'Angalia hali ya NHIF yako na uwasilishe madai hapa.',
    
    // Offline message
    offlineHelp: 'Msaada unapatikana nje ya mtandao. Data itasasishwa unapounganisha.',
    
    // Task list
    completeProfile: 'Kamilisha wasifu wako',
    addMedicalHistory: 'Ongeza historia ya kimatibabu',
    bookFirstAppointment: 'Tenga miadi yako ya kwanza',
    exploreTelehealth: 'Chunguza huduma za telemedicine',
  },
  en: {
    help: 'Help',
    searchHelp: 'Search help...',
    close: 'Close',
    next: 'Next',
    previous: 'Previous',
    gotIt: 'Got it',
    learnMore: 'Learn more',
    skip: 'Skip',
    showMeHow: 'Show me how',
    quickTips: 'Quick Tips',
    helpCenter: 'Help Center',
    tutorials: 'Tutorials',
    faq: 'FAQ',
    contactSupport: 'Contact Support',
    tipOfTheDay: 'Tip of the Day',
    helpfulResources: 'Helpful Resources',
    
    // Common guidance content
    appointmentHelp: 'Tap "Appointments" to book, reschedule, or cancel your visits.',
    symptomsHelp: 'Use "Check Symptoms" to get instant AI-powered recommendations.',
    resultsHelp: 'Your lab results will be available here 24 hours after testing.',
    nhifHelp: 'Check your NHIF status and submit claims here.',
    
    // Offline message
    offlineHelp: 'Help is available offline. Data will sync when you reconnect.',
    
    // Task list
    completeProfile: 'Complete your profile',
    addMedicalHistory: 'Add medical history',
    bookFirstAppointment: 'Book your first appointment',
    exploreTelehealth: 'Explore telehealth services',
  },
};

// Guidance content database (offline-first, admin-editable in production)
const guidanceDatabase: Record<string, GuidanceContent[]> = {
  dashboard: [
    {
      id: 'dashboard-welcome',
      type: 'walkthrough',
      trigger: 'dashboard',
      title: 'Welcome to AfyaAI',
      content: 'Let me show you around your healthcare dashboard.',
      dismissable: true,
      priority: 1,
    },
    {
      id: 'dashboard-symptoms',
      type: 'tooltip',
      trigger: 'dashboard',
      title: 'Check Your Symptoms',
      content: 'Tap here to describe your symptoms and get instant AI-powered guidance.',
      targetElement: 'symptom-checker-button',
      position: 'bottom',
      dismissable: true,
      priority: 2,
    },
  ],
  appointments: [
    {
      id: 'appointments-guide',
      type: 'smart-tip',
      trigger: 'appointments',
      title: 'Booking Made Easy',
      content: 'Book appointments in 3 simple steps. Choose date, time, and doctor.',
      dismissable: true,
      priority: 1,
    },
  ],
  'first-time': [
    {
      id: 'onboarding-tasks',
      type: 'task-list',
      trigger: 'first-time',
      title: 'Getting Started',
      content: 'Complete these tasks to get the most out of AfyaAI.',
      dismissable: false,
      priority: 10,
    },
  ],
};

export function InAppGuidanceSystem({ enabled = true }: InAppGuidanceSystemProps) {
  const { language, isOffline } = useAppStore();
  const t = translations[language];
  
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeGuidance, setActiveGuidance] = useState<GuidanceContent | null>(null);
  const [completedGuidance, setCompletedGuidance] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Load completed guidance from localStorage
  useEffect(() => {
    const completed = localStorage.getItem('completed_guidance');
    if (completed) {
      try {
        setCompletedGuidance(JSON.parse(completed));
      } catch (e) {
      }
    }
  }, []);
  
  // Save completed guidance
  const markAsCompleted = (guidanceId: string) => {
    const updated = [...completedGuidance, guidanceId];
    setCompletedGuidance(updated);
    localStorage.setItem('completed_guidance', JSON.stringify(updated));
  };
  
  // Show guidance based on page/trigger
  useEffect(() => {
    if (!enabled) return;
    
    const pageGuidance = guidanceDatabase[currentPage] || [];
    const uncompletedGuidance = pageGuidance
      .filter((g) => !completedGuidance.includes(g.id))
      .sort((a, b) => b.priority - a.priority);
    
    if (uncompletedGuidance.length > 0) {
      // Show highest priority guidance
      setTimeout(() => {
        setActiveGuidance(uncompletedGuidance[0]);
      }, 500);
    }
  }, [currentPage, completedGuidance, enabled]);
  
  const handleDismissGuidance = () => {
    if (activeGuidance) {
      markAsCompleted(activeGuidance.id);
      setActiveGuidance(null);
    }
  };
  
  // Floating Help Button
  if (!enabled) return null;
  
  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-24 right-4 z-40"
      >
        <Button
          size="lg"
          onClick={() => setIsHelpOpen(true)}
          className="rounded-full w-14 h-14 bg-[#1E88E5] hover:bg-[#1976D2] shadow-lg"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
        {/* Notification badge for new tips */}
        {activeGuidance && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            1
          </span>
        )}
      </motion.div>

      {/* Active Guidance Tooltip/Overlay */}
      <AnimatePresence>
        {activeGuidance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-40 right-4 left-4 md:left-auto md:w-96 z-50"
          >
            <Card className="border-blue-500 bg-white shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <Lightbulb className="h-5 w-5 text-[#FFB300] mr-2" />
                    <h3 className="font-semibold">{activeGuidance.title}</h3>
                  </div>
                  {activeGuidance.dismissable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDismissGuidance}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{activeGuidance.content}</p>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleDismissGuidance}
                    className="bg-[#1E88E5] hover:bg-[#1976D2]"
                  >
                    {t.gotIt}
                  </Button>
                  {activeGuidance.dismissable && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismissGuidance}
                    >
                      {t.skip}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Center Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsHelpOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1E88E5] to-[#43A047] text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{t.helpCenter}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHelpOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchHelp}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Offline Notice */}
                {isOffline && (
                  <Card className="mb-4 border-amber-200 bg-amber-50">
                    <CardContent className="p-3 flex items-start">
                      <Info className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                      <p className="text-sm text-amber-900">{t.offlineHelp}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Tips */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-[#FFB300]" />
                    {t.quickTips}
                  </h3>
                  <div className="space-y-2">
                    {[
                      { title: t.completeProfile, completed: false },
                      { title: t.addMedicalHistory, completed: false },
                      { title: t.bookFirstAppointment, completed: false },
                      { title: t.exploreTelehealth, completed: false },
                    ].map((tip, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            {tip.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-3" />
                            )}
                            <span className="text-sm">{tip.title}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Common Help Topics */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Book className="h-5 w-5 mr-2 text-[#1E88E5]" />
                    {t.helpfulResources}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { title: 'Appointments', desc: t.appointmentHelp, icon: '📅' },
                      { title: 'Symptoms', desc: t.symptomsHelp, icon: '🩺' },
                      { title: 'Lab Results', desc: t.resultsHelp, icon: '🔬' },
                      { title: 'NHIF', desc: t.nhifHelp, icon: '💳' },
                    ].map((topic, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start">
                            <span className="text-2xl mr-3">{topic.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{topic.title}</h4>
                              <p className="text-sm text-gray-600">{topic.desc}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Contact Support */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold mb-2">{t.contactSupport}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {language === 'sw'
                        ? 'Je, bado unahitaji msaada? Wasiliana nasi.'
                        : 'Still need help? Contact us.'}
                    </p>
                    <Button variant="outline" size="sm">
                      {t.learnMore}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
