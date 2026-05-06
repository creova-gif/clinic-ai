import React, { useState, useEffect } from 'react';
import { PatientPortalHub } from './PatientPortalHub';
import { DigitalPatientOnboarding, PatientOnboardingData } from './DigitalPatientOnboarding';
import { InAppGuidanceSystem } from './InAppGuidanceSystem';
import { NotificationSystem } from './NotificationSystem';
import { SelfHelpCenter } from './SelfHelpCenter';
import { useApp } from '@/app/context/AppContext';

interface PatientPortalManagerProps {
  enabled?: boolean;
  onPortalDataUpdate?: (data: any) => void;
}

/**
 * PatientPortalManager
 * 
 * Orchestrates all patient portal enhancement features:
 * 1. Digital Receptionist (PatientPortalHub)
 * 2. Digital Patient Onboarding
 * 3. In-App Guidance System
 * 4. Multi-Channel Notifications
 * 5. Self-Help Center
 * 6. EHR Integration (invisible UX)
 * 7. Analytics tracking
 * 8. Patient Feedback loops
 * 9. Adoption barriers countermeasures
 * 10. Privacy/Compliance UI
 */
export function PatientPortalManager({ 
  enabled = true,
  onPortalDataUpdate 
}: PatientPortalManagerProps) {
  const { userRole, userData, language } = useApp();
  
  // Portal states
  const [showPortalHub, setShowPortalHub] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSelfHelp, setShowSelfHelp] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  // Check if user needs onboarding
  useEffect(() => {
    if (userRole === 'patient' && enabled) {
      const completed = localStorage.getItem('patient_portal_onboarding_complete');
      setOnboardingComplete(completed === 'true');
      
      // Check if registration is incomplete
      const registrationData = localStorage.getItem('patient_onboarding_draft');
      if (!completed && !registrationData) {
        // First time - show onboarding after a delay
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [userRole, enabled]);
  
  // Analytics tracking (privacy-safe)
  useEffect(() => {
    if (enabled && userRole === 'patient') {
      trackAnalytics('portal_view', {
        timestamp: new Date().toISOString(),
        onboardingComplete,
      });
    }
  }, [enabled, userRole, onboardingComplete]);
  
  const trackAnalytics = (event: string, data: any) => {
    // Store analytics locally (privacy-safe, no PII)
    const analytics = JSON.parse(localStorage.getItem('portal_analytics') || '[]');
    analytics.push({
      event,
      data,
      timestamp: new Date().toISOString(),
    });
    // Keep only last 100 events
    if (analytics.length > 100) {
      analytics.shift();
    }
    localStorage.setItem('portal_analytics', JSON.stringify(analytics));
  };
  
  const handleOnboardingComplete = (data: PatientOnboardingData) => {
    setOnboardingComplete(true);
    localStorage.setItem('patient_portal_onboarding_complete', 'true');
    setShowOnboarding(false);
    
    // Track completion
    trackAnalytics('onboarding_complete', {
      hasEmail: !!data.personalInfo.email,
      hasAllergies: !!data.medicalHistory.allergies,
      consentGiven: data.consent.dataSharing && data.consent.treatment && data.consent.privacy,
    });
    
    // Notify parent component
    if (onPortalDataUpdate) {
      onPortalDataUpdate({
        type: 'onboarding_complete',
        data,
      });
    }
    
    // Show success message
    setTimeout(() => {
      setShowPortalHub(true);
    }, 1000);
  };
  
  const handlePortalNavigation = (route: string) => {
    trackAnalytics('portal_navigation', { route });
    
    // Handle different routes
    switch (route) {
      case 'registration':
        setShowOnboarding(true);
        setShowPortalHub(false);
        break;
      case 'help':
        setShowSelfHelp(true);
        break;
      case 'appointments':
      case 'payments':
      case 'lab-results':
      case 'prescriptions':
      case 'telemedicine':
      case 'health-education':
        // These would navigate to actual screens in production
        trackAnalytics('feature_access_attempt', { route });
        break;
      default:
    }
  };
  
  // Don't render if not enabled or not a patient
  if (!enabled || userRole !== 'patient') {
    return null;
  }
  
  return (
    <>
      {/* Always-on components */}
      <InAppGuidanceSystem enabled={enabled} />
      <NotificationSystem enabled={enabled} />
      
      {/* Conditional modals/screens */}
      {showPortalHub && (
        <PatientPortalHub
          onNavigate={handlePortalNavigation}
          onClose={() => {
            setShowPortalHub(false);
            trackAnalytics('portal_hub_closed', {});
          }}
        />
      )}
      
      {showOnboarding && (
        <DigitalPatientOnboarding
          onComplete={handleOnboardingComplete}
          onClose={() => {
            setShowOnboarding(false);
            trackAnalytics('onboarding_dismissed', {});
          }}
        />
      )}
      
      {showSelfHelp && (
        <SelfHelpCenter
          isOpen={showSelfHelp}
          onClose={() => {
            setShowSelfHelp(false);
            trackAnalytics('self_help_closed', {});
          }}
        />
      )}
      
      {/* Hidden EHR Integration Status */}
      <EHRSyncStatus />
      
      {/* Privacy & Compliance Indicator */}
      <PrivacyIndicator />
    </>
  );
}

/**
 * EHRSyncStatus
 * Invisible UX component that shows sync status when needed
 */
function EHRSyncStatus() {
  const { language, isOffline } = useApp();
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [showStatus, setShowStatus] = useState(false);
  
  useEffect(() => {
    // Simulate sync status checks
    if (isOffline) {
      setSyncStatus('error');
      setShowStatus(true);
      
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setSyncStatus('synced');
    }
  }, [isOffline]);
  
  if (!showStatus) return null;
  
  const statusMessages = {
    sw: {
      synced: 'Data imesasishwa',
      syncing: 'Inasasisha data...',
      error: 'Hakuna mtandao. Data itasasishwa unapounganisha.',
    },
    en: {
      synced: 'Data synced',
      syncing: 'Syncing data...',
      error: 'No connection. Data will sync when you reconnect.',
    },
  };
  
  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-30 animate-in slide-in-from-top">
      <div
        className={`rounded-full px-4 py-2 shadow-lg text-sm ${
          syncStatus === 'error'
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : syncStatus === 'syncing'
            ? 'bg-blue-100 text-blue-900 border border-blue-300'
            : 'bg-green-100 text-green-900 border border-green-300'
        }`}
      >
        {statusMessages[language][syncStatus]}
      </div>
    </div>
  );
}

/**
 * PrivacyIndicator
 * Visible trust feature showing data protection
 */
function PrivacyIndicator() {
  const { language } = useApp();
  const [showIndicator, setShowIndicator] = useState(false);
  
  // Show privacy indicator on first load
  useEffect(() => {
    const shown = localStorage.getItem('privacy_indicator_shown');
    if (!shown) {
      setShowIndicator(true);
      localStorage.setItem('privacy_indicator_shown', 'true');
      
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  if (!showIndicator) return null;
  
  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-30 animate-in slide-in-from-bottom">
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="bg-green-500 text-white rounded-full p-2 mr-3">
            🔒
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-1">
              {language === 'sw' ? 'Data Yako Inalindwa' : 'Your Data is Protected'}
            </h4>
            <p className="text-sm text-green-800">
              {language === 'sw'
                ? 'Tunatumia usimbaji fiche wa hali ya juu na kufuata PDPA Tanzania. Data yako haishiriki bila idhini yako.'
                : 'We use high-level encryption and follow Tanzania PDPA. Your data is never shared without your consent.'}
            </p>
            <button
              onClick={() => setShowIndicator(false)}
              className="text-xs text-green-600 underline mt-2"
            >
              {language === 'sw' ? 'Nimeelewa' : 'Got it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
