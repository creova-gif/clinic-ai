/**
 * NationalInfrastructureApp - Complete World-Class Platform
 * 
 * DESIGN STANDARD: NHS App, Mayo Clinic, Teladoc
 * CONTEXT: Tanzania National Healthcare Infrastructure
 * 
 * PRINCIPLES:
 * - Institutional
 * - Calm
 * - Trustworthy
 * - Modern
 * - Human-led
 * - Long-term sustainable
 * - Technically mature
 * - Accessible (rural + urban)
 * 
 * FLOW:
 * Splash → Onboarding → Home → [Care/Assistant/Messages/Profile]
 */

import React, { useState, useEffect } from 'react';
import { NationalSplash } from './NationalSplash';
import { NationalOnboarding } from './NationalOnboarding';
import { EliteHome } from './EliteHome';
import { EliteMessages } from './EliteMessages';
import { EliteAssistant } from './EliteAssistant';
import { EliteProfile } from './EliteProfile';
import { EliteRecords } from './EliteRecords';
import { EmergencyScreen } from './EmergencyScreen';
import { NationalBottomNav } from './NationalBottomNav';
import { ConnectivityIndicator } from './ConnectivityIndicator';
import { WifiOff } from 'lucide-react';
import { colors } from '@/app/design-system';
import { EnhancedSymptomChecker } from './EnhancedSymptomChecker';
import { AppointmentSystem } from './AppointmentSystem';
import { MaternalCareJourney } from './MaternalCareJourney';
import { MedicationTracker } from './MedicationTracker';
import { ClinicFinder } from './ClinicFinder';
import { TestResultsViewer } from './TestResultsViewer';
import { TelemedicineInterface } from './TelemedicineInterface';
import { SecureStorage, StorageMigration } from '@/app/utils/SecureStorage';

interface UserData {
  language: 'sw' | 'en';
  name: string;
  phone: string;
  consentGiven: boolean;
}

type Route =
  | 'home'
  | 'care'
  | 'assistant'
  | 'messages'
  | 'profile'
  | 'emergency'
  | 'symptom-checker'
  | 'records'
  | 'appointments'
  | 'find-clinic'
  | 'maternal'
  | 'medication-help'
  | 'results-help'
  | 'talk-to-doctor';

export function NationalInfrastructureApp() {
  // State
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check saved user data on mount
  useEffect(() => {
    try {
      const saved = SecureStorage.getItem('afyacare_national_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserData(parsed);
        } catch {
          SecureStorage.removeItem('afyacare_national_user');
        }
      }
    } catch {
      // Storage unavailable — fall through to onboarding
    }
  }, []);

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handlers
  const handleSplashComplete = () => {
    setShowSplash(false);
    if (!userData) setShowOnboarding(true);
  };

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data);
    SecureStorage.setItem('afyacare_national_user', JSON.stringify(data));
    setShowOnboarding(false);
  };

  const handleLogout = () => {
    SecureStorage.removeItem('afyacare_national_user');
    setUserData(null);
    setCurrentRoute('home');
    setShowOnboarding(true);
  };

  const handleNavigate = (route: string) => {
    setCurrentRoute(route as Route);
  };

  // Show splash
  if (showSplash) return <NationalSplash onComplete={handleSplashComplete} />;

  // Show onboarding
  if (showOnboarding || !userData) {
    return <NationalOnboarding onComplete={handleOnboardingComplete} />;
  }

  const language = userData.language;

  // Main App
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-4 z-50">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#FEF2F2] border-2 rounded-lg text-sm font-medium" style={{ borderColor: colors.danger[500], color: colors.danger[700] }}>
            <WifiOff className="w-4 h-4" />
            <span>{language === 'sw' ? 'Nje ya mtandao' : 'Offline'}</span>
          </div>
        </div>
      )}

      {/* Route Content */}
      {currentRoute === 'home' && (
        <EliteHome
          userName={userData.name}
          language={language}
          onNavigate={handleNavigate}
        />
      )}

      {currentRoute === 'care' && (
        <EliteRecords
          language={language}
          onBack={() => setCurrentRoute('home')}
          onNavigate={handleNavigate}
        />
      )}

      {currentRoute === 'assistant' && (
        <EliteAssistant
          language={language}
          onBack={() => setCurrentRoute('home')}
          onNavigate={handleNavigate}
        />
      )}

      {currentRoute === 'messages' && (
        <EliteMessages
          language={language}
          onBack={() => setCurrentRoute('home')}
          onNavigate={handleNavigate}
        />
      )}

      {currentRoute === 'profile' && (
        <EliteProfile
          onBack={() => setCurrentRoute('home')}
          onLogout={handleLogout}
        />
      )}

      {currentRoute === 'emergency' && (
        <EmergencyScreen
          language={language}
          onBack={() => setCurrentRoute('home')}
        />
      )}

      {/* CORE FEATURES - FULLY WIRED */}
      {currentRoute === 'symptom-checker' && (
        <EnhancedSymptomChecker
          onBack={() => setCurrentRoute('home')}
        />
      )}

      {currentRoute === 'appointments' && (
        <AppointmentSystem
          language={language}
          onBack={() => setCurrentRoute('home')}
        />
      )}

      {currentRoute === 'maternal' && (
        <MaternalCareJourney
          language={language}
          onBack={() => setCurrentRoute('home')}
        />
      )}

      {currentRoute === 'medication-help' && (
        <MedicationTracker
          language={language}
          onBack={() => setCurrentRoute('home')}
        />
      )}

      {/* 'records' route - duplicate of 'care', redirect to care */}
      {currentRoute === 'records' && (
        <EliteRecords
          language={language}
          onBack={() => setCurrentRoute('home')}
          onNavigate={handleNavigate}
        />
      )}

      {/* NEW FEATURES - FULLY IMPLEMENTED */}
      {currentRoute === 'find-clinic' && (
        <ClinicFinder
          language={language}
          onBack={() => setCurrentRoute('home')}
        />
      )}

      {currentRoute === 'results-help' && (
        <TestResultsViewer
          language={language}
          onBack={() => setCurrentRoute('home')}
        />
      )}

      {currentRoute === 'talk-to-doctor' && (
        <TelemedicineInterface
          language={language}
          onBack={() => setCurrentRoute('home')}
        />
      )}

      {/* Bottom Navigation */}
      {!['emergency'].includes(currentRoute) && (
        <NationalBottomNav
          currentRoute={currentRoute}
          language={language}
          onNavigate={(route) => setCurrentRoute(route as Route)}
        />
      )}
    </div>
  );
}