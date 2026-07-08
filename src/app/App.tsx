import { Suspense, lazy, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { useAppStore } from './store/useAppStore';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';
import '../styles/fonts.css';
import '../styles/theme.css';

// Error Boundary
import { ErrorBoundary } from './components/ErrorBoundary';

// Monitoring & Analytics
import {
  initializeMonitoring,
  trackPageView,
  trackFeatureUsage,
  trackDisclaimerAcceptance,
} from './utils/monitoring';

// Components
import { ModernSplash as SplashScreen } from './components/ModernSplash';
import { BottomNavigation } from './components/BottomNavigation';
import { Globe } from 'lucide-react';
import { Button } from './components/ui/button';
import type { OnboardingData } from './components/OnboardingOrchestrator';

// ✅ PERFORMANCE: Lazy load legacy components (for compatibility)
const OnboardingOrchestrator = lazy(() => import('./components/OnboardingOrchestrator').then(m => ({ default: m.OnboardingOrchestrator })));
const OnboardingEnhancementManager = lazy(() => import('./components/OnboardingEnhancementManager').then(m => ({ default: m.OnboardingEnhancementManager })));
const MicroFeedback = lazy(() => import('./components/MicroFeedback').then(m => ({ default: m.MicroFeedback })));
const PatientPortalManager = lazy(() => import('./components/PatientPortalManager').then(m => ({ default: m.PatientPortalManager })));
const PatientDashboard = lazy(() => import('./components/ModernHomeRedesigned').then(m => ({ default: m.ModernHome })));
const EnhancedSymptomChecker = lazy(() => import('./components/EnhancedSymptomChecker').then(m => ({ default: m.EnhancedSymptomChecker })));
const AppointmentsScreen = lazy(() => import('./components/AppointmentsScreen').then(m => ({ default: m.AppointmentsScreen })));
const ProfileScreen = lazy(() => import('./components/ProfileRedesigned').then(m => ({ default: m.Profile })));
const MaternalCareTracker = lazy(() => import('./components/MaternalCareTracker').then(m => ({ default: m.MaternalCareTracker })));
const CHWDashboard = lazy(() => import('./components/CHWDashboard').then(m => ({ default: m.CHWDashboard })));
const MoHDashboard = lazy(() => import('./components/MoHDashboard').then(m => ({ default: m.MoHDashboard })));
const AIArchitectureDashboard = lazy(() => import('./components/AIArchitectureDashboard').then(m => ({ default: m.AIArchitectureDashboard })));
const MedicationTracker = lazy(() => import('./components/MedicationTracker').then(m => ({ default: m.MedicationTracker })));
const FacilityFinder = lazy(() => import('./components/FacilityFinder').then(m => ({ default: m.FacilityFinder })));
const CHWRouteOptimizer = lazy(() => import('./components/CHWRouteOptimizer').then(m => ({ default: m.CHWRouteOptimizer })));
const SafetyDisclaimerModal = lazy(() => import('./components/SafetyDisclaimerModal').then(m => ({ default: m.SafetyDisclaimerModal })));
const AdminMonitoringDashboard = lazy(() => import('./components/AdminMonitoringDashboard').then(m => ({ default: m.AdminMonitoringDashboard })));
const TelemedicineInterface = lazy(() => import('./components/TelemedicineInterface').then(m => ({ default: m.TelemedicineInterface })));
const TestResultsViewer = lazy(() => import('./components/TestResultsViewer').then(m => ({ default: m.TestResultsViewer })));
const EmergencyScreen = lazy(() => import('./components/EmergencyScreen').then(m => ({ default: m.EmergencyScreen })));
const ClinicalDashboard = lazy(() => import('./components/ClinicalDashboard').then(m => ({ default: m.ClinicalDashboard })));
const AIHealthChat = lazy(() => import('./components/AIHealthChat').then(m => ({ default: m.AIHealthChat })));

// Loading components - Premium skeleton states
import { SkeletonDashboardGrid, Spinner } from './components/ui/skeleton';

// Loading spinner component — CREOVA Medical branded
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
      >
        <Spinner size="sm" className="text-white" />
      </div>
      <p className="text-sm text-gray-400 font-medium">CREOVA Medical</p>
    </div>
  );
}

// Dashboard loading state - Premium skeleton
function DashboardLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
        
        {/* Stats grid skeleton */}
        <SkeletonDashboardGrid />
        
        {/* Content skeleton */}
        <div className="mt-6 space-y-4">
          <div className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />
          <div className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { userRole, language, setLanguage, setUserRole, setUserData } = useAppStore();
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTrigger, setFeedbackTrigger] = useState<'first-action' | '7-days' | 'feature-use'>('first-action');
  const [useWorldClassMode, setUseWorldClassMode] = useState(true); // Toggle for world-class experience
  
  // Safety disclaimer state
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerTool, setDisclaimerTool] = useState<'symptomChecker' | 'appointment' | 'aiGuidance'>('symptomChecker');
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // Check if this is first launch
  useEffect(() => {
    const hasLaunchedBefore = localStorage.getItem('app_launched') === 'true';
    const worldClassPref = localStorage.getItem('world_class_mode');
    if (worldClassPref !== null) {
      setUseWorldClassMode(worldClassPref === 'true');
    }
    if (!hasLaunchedBefore) {
      setIsFirstLaunch(true);
      localStorage.setItem('app_launched', 'true');
    }
  }, []);

  // Check for 7-day feedback trigger
  useEffect(() => {
    if (userRole) {
      const firstUseDate = localStorage.getItem('first_use_date');
      if (!firstUseDate) {
        localStorage.setItem('first_use_date', new Date().toISOString());
      } else {
        const daysSinceFirstUse = Math.floor(
          (new Date().getTime() - new Date(firstUseDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceFirstUse >= 7 && !localStorage.getItem('7day_feedback_shown')) {
          setFeedbackTrigger('7-days');
          setShowFeedback(true);
          localStorage.setItem('7day_feedback_shown', 'true');
        }
      }
    }
  }, [userRole]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (!userRole) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    // Determine role from user type
    let role: string;
    if (data.userType === 'patient') {
      role = 'patient';
    } else if (data.employeeData?.role === 'clinician') {
      role = 'clinician';
    } else if (data.employeeData?.role === 'admin') {
      role = 'admin';
    } else if (data.employeeData?.role === 'chw') {
      role = 'chw';
    } else {
      role = 'patient'; // fallback
    }

    setUserRole(role as any);
    setLanguage(data.language);
    setUserData({
      consented: data.accountData?.consented || true,
      name: data.accountData?.phone || 'User',
      phone: data.accountData?.phone,
      email: data.accountData?.email,
      biometricEnabled: data.accountData?.biometricEnabled,
      goals: data.personalizationData?.goals,
      wearableConnected: data.wearableData?.synced,
    });
    setShowOnboarding(false);
  };

  const handleEnhancementComplete = (_data: any) => {
    // Enhancement onboarding complete — no PHI logged
  };

  const handleFeedbackSubmit = (_feedback: { rating: number; comment?: string }) => {
    setShowFeedback(false);
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentRoute('dashboard');
    setShowOnboarding(true);
  };

  // Navigation with safety disclaimer check
  const handleNavigateWithDisclaimer = (route: string) => {
    // Check if route requires disclaimer and hasn't been accepted yet
    const requiresDisclaimer = ['symptom-checker', 'appointments'].includes(route);
    
    if (requiresDisclaimer) {
      const disclaimerKey = `disclaimer_${route}_accepted`;
      const hasAccepted = localStorage.getItem(disclaimerKey) === 'true';
      
      if (!hasAccepted) {
        // Show disclaimer first
        setPendingRoute(route);
        setDisclaimerTool(route === 'symptom-checker' ? 'symptomChecker' : 'appointment');
        setShowDisclaimer(true);
        return;
      }
    }
    
    // Navigate directly if no disclaimer needed or already accepted
    setCurrentRoute(route);
  };

  const handleDisclaimerAccept = () => {
    if (pendingRoute) {
      // Store acceptance
      const disclaimerKey = `disclaimer_${pendingRoute}_accepted`;
      localStorage.setItem(disclaimerKey, 'true');
      
      // Navigate to pending route
      setCurrentRoute(pendingRoute);
      setPendingRoute(null);
    }
    setShowDisclaimer(false);
  };

  const handleDisclaimerDecline = () => {
    setPendingRoute(null);
    setShowDisclaimer(false);
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show new onboarding orchestrator if no user role
  if (showOnboarding || !userRole) {
    return <OnboardingOrchestrator onComplete={handleOnboardingComplete} />;
  }

  // Language toggle button (accessible from anywhere)
  const LanguageToggle = () => (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
        className="bg-white shadow-lg"
      >
        <Globe className="h-4 w-4 mr-2" />
        {language === 'sw' ? 'EN' : 'SW'}
      </Button>
    </div>
  );

  // Patient role routing
  if (userRole === 'patient') {
    return (
      <>
        <LanguageToggle />
        
        {/* Patient Portal Manager - Comprehensive portal enhancement system */}
        <PatientPortalManager
          enabled={true}
          onPortalDataUpdate={(_data) => { /* portal data synced */ }}
        />
        
        {/* Onboarding Enhancement Manager */}
        {userRole && (
          <OnboardingEnhancementManager
            language={language}
            userRole={userRole}
            isFirstLaunch={isFirstLaunch}
            onEnhancementComplete={handleEnhancementComplete}
          />
        )}

        {/* Micro Feedback */}
        {showFeedback && (
          <Suspense fallback={<LoadingSpinner />}>
            <MicroFeedback
              language={language}
              trigger={feedbackTrigger}
              onSubmit={handleFeedbackSubmit}
              onDismiss={() => setShowFeedback(false)}
            />
          </Suspense>
        )}

        {/* Safety Disclaimer Modal */}
        {showDisclaimer && (
          <Suspense fallback={null}>
            <SafetyDisclaimerModal
              isOpen={showDisclaimer}
              tool={disclaimerTool}
              language={language}
              onAccept={handleDisclaimerAccept}
              onDecline={handleDisclaimerDecline}
            />
          </Suspense>
        )}

        <Suspense fallback={<LoadingSpinner />}>
          {currentRoute === 'dashboard' && (
            <PatientDashboard onNavigate={handleNavigateWithDisclaimer} />
          )}
          {currentRoute === 'symptom-checker' && (
            <EnhancedSymptomChecker onBack={() => setCurrentRoute('dashboard')} />
          )}
          {currentRoute === 'appointments' && (
            <AppointmentsScreen onBack={() => setCurrentRoute('dashboard')} />
          )}
          {currentRoute === 'profile' && (
            <ProfileScreen
              language={language as 'sw' | 'en'}
              onBack={() => setCurrentRoute('dashboard')}
              onNavigate={setCurrentRoute}
              onLanguageChange={(lang) => setLanguage(lang as any)}
              onLogout={handleLogout}
              userRole="patient"
              userData={{
                name: userData?.name || (language === 'sw' ? 'Mtumiaji' : 'User'),
                dateOfBirth: userData?.dateOfBirth || '1990-01-01',
                gender: userData?.gender || (language === 'sw' ? 'Haijulikani' : 'Unknown'),
                phone: userData?.phone || '',
                email: userData?.email,
                afyaId: userData?.afyaId || 'AFY-000000',
                bloodType: userData?.bloodType,
                allergies: userData?.allergies || [],
                chronicConditions: userData?.chronicConditions || [],
                emergencyContacts: userData?.emergencyContacts || [],
              }}
            />
          )}
          {currentRoute === 'maternal' && (
            <MaternalCareTracker onBack={() => setCurrentRoute('dashboard')} />
          )}
          {currentRoute === 'medications' && (
            <MedicationTracker onBack={() => setCurrentRoute('dashboard')} />
          )}
          {(currentRoute === 'facilities' || currentRoute === 'clinic-finder') && (
            <FacilityFinder onBack={() => setCurrentRoute('dashboard')} />
          )}
          {currentRoute === 'emergency' && (
            <EmergencyScreen
              language={language as 'sw' | 'en'}
            />
          )}
          {currentRoute === 'ai-chat' && (
            <AIHealthChat
              onBack={() => setCurrentRoute('dashboard')}
              onNavigate={setCurrentRoute}
            />
          )}
          {(currentRoute === 'telemedicine' || currentRoute === 'talk-to-doctor') && (
            <TelemedicineInterface
              language={language as 'sw' | 'en'}
              onBack={() => setCurrentRoute('dashboard')}
            />
          )}
          {(currentRoute === 'results-help' || currentRoute === 'health-records') && (
            <TestResultsViewer
              language={language as 'sw' | 'en'}
              onBack={() => setCurrentRoute('dashboard')}
            />
          )}
          {currentRoute === 'ncds' && (
            <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl mb-4">
                  {language === 'sw' ? 'Inakuja Hivi Karibuni' : 'Coming Soon'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {language === 'sw'
                    ? 'Kipengele hiki kinajengwa.'
                    : 'This feature is being built.'}
                </p>
                <Button onClick={() => setCurrentRoute('dashboard')}>
                  {language === 'sw' ? 'Rudi Nyumbani' : 'Back to Home'}
                </Button>
              </div>
            </div>
          )}
        </Suspense>
        <BottomNavigation
          activeRoute={currentRoute}
          onNavigate={handleNavigateWithDisclaimer}
        />
      </>
    );
  }

  // CHW role
  if (userRole === 'chw') {
    return (
      <>
        <LanguageToggle />
        
        {/* Onboarding Enhancement Manager */}
        <OnboardingEnhancementManager
          language={language}
          userRole={userRole}
          isFirstLaunch={isFirstLaunch}
          onEnhancementComplete={handleEnhancementComplete}
        />

        <Suspense fallback={<LoadingSpinner />}>
          {currentRoute === 'dashboard' && (
            <CHWDashboard 
              onBack={handleLogout}
              onNavigate={setCurrentRoute}
            />
          )}
          {currentRoute === 'route-optimizer' && (
            <CHWRouteOptimizer onBack={() => setCurrentRoute('dashboard')} />
          )}
        </Suspense>
      </>
    );
  }

  // Clinician role
  if (userRole === 'clinician') {
    return (
      <>
        <LanguageToggle />

        {/* Onboarding Enhancement Manager */}
        <OnboardingEnhancementManager
          language={language}
          userRole={userRole}
          isFirstLaunch={isFirstLaunch}
          onEnhancementComplete={handleEnhancementComplete}
        />

        <Suspense fallback={<DashboardLoader />}>
          <ClinicalDashboard
            language={language as 'sw' | 'en'}
            onLogout={handleLogout}
            providerName="Dr. Clinician"
          />
        </Suspense>
      </>
    );
  }

  // Admin role
  if (userRole === 'admin') {
    if (currentRoute === 'ai-architecture') {
      return (
        <>
          <LanguageToggle />
          <AIArchitectureDashboard onBack={() => setCurrentRoute('dashboard')} />
        </>
      );
    }
    
    if (currentRoute === 'monitoring') {
      return (
        <>
          <LanguageToggle />
          <Suspense fallback={<DashboardLoader />}>
            <AdminMonitoringDashboard 
              onBack={() => setCurrentRoute('dashboard')}
              language={language}
            />
          </Suspense>
        </>
      );
    }
    
    return (
      <>
        <LanguageToggle />
        <MoHDashboard 
          onBack={handleLogout}
          onViewArchitecture={() => setCurrentRoute('ai-architecture')}
          onViewMonitoring={() => setCurrentRoute('monitoring')}
        />
      </>
    );
  }

  return null;
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <MotionConfig reducedMotion="user">
          <Suspense fallback={<LoadingSpinner />}>
            <AppContent />
          </Suspense>
        </MotionConfig>
      </ErrorBoundary>
    </I18nextProvider>
  );
}