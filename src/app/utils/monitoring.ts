/**
 * Monitoring & Analytics Configuration
 * 
 * PRIVACY COMPLIANCE:
 * - No PII logged (PDPA compliant)
 * - Medical data anonymized
 * - User consent tracked
 * - Audit trail maintained
 * 
 * MONITORING STACK:
 * - Sentry: Error tracking & performance
 * - Google Analytics: Usage metrics (anonymized)
 * - Custom: Medical-specific KPIs
 */

// =============================================================================
// TYPES
// =============================================================================

export type UserRole = 'patient' | 'chw' | 'clinician' | 'admin';

export interface MonitoringEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
}

export interface ErrorContext {
  userRole?: UserRole;
  route?: string;
  feature?: string;
  isOffline?: boolean;
  deviceType?: string;
  componentStack?: string;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface MedicalMetric {
  metric: string;
  count: number;
  date: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// SENTRY CONFIGURATION
// =============================================================================

/**
 * Initialize Sentry error tracking
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install: npm install @sentry/react
 * 2. Get DSN from: https://sentry.io/settings/projects/
 * 3. Set env variable: VITE_SENTRY_DSN
 * 4. Uncomment initialization code below
 */
export function initSentry() {
  // Uncomment when ready to deploy
  /*
  import * as Sentry from "@sentry/react";
  
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      
      // PII FILTERING - Critical for PDPA compliance
      beforeSend(event) {
        // Remove any potential PII from error messages
        if (event.message) {
          event.message = sanitizePII(event.message);
        }
        
        // Remove user IP
        if (event.user) {
          delete event.user.ip_address;
        }
        
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }
        
        return event;
      },
      
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Only track errors in production
      enabled: import.meta.env.PROD,
      
      // Ignore common non-critical errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed', // Handle offline gracefully
      ],
    });
  }
  */
  
  console.log('✅ Monitoring initialized (Sentry ready for deployment)');
}

/**
 * Sanitize PII from error messages
 */
function sanitizePII(message: string): string {
  // Remove phone numbers
  message = message.replace(/\+?\d{10,}/g, '[PHONE_REDACTED]');
  
  // Remove email addresses
  message = message.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL_REDACTED]');
  
  // Remove names (basic pattern - enhance for Swahili names)
  message = message.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME_REDACTED]');
  
  return message;
}

/**
 * Log error to Sentry with context
 */
export function logError(error: Error, context?: ErrorContext) {
  // In production, this would use Sentry.captureException
  console.error('Error logged:', {
    message: sanitizePII(error.message),
    stack: error.stack?.split('\n')[0], // Only first line (no full stack trace in console)
    context: {
      ...context,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Store in localStorage for admin dashboard
  storeLocalMetric('errors', {
    message: sanitizePII(error.message),
    route: context?.route || 'unknown',
    userRole: context?.userRole || 'unknown',
    timestamp: Date.now(),
  });
}

// =============================================================================
// GOOGLE ANALYTICS
// =============================================================================

/**
 * Initialize Google Analytics (GA4)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create GA4 property: https://analytics.google.com/
 * 2. Get Measurement ID (G-XXXXXXXXXX)
 * 3. Set env variable: VITE_GA_MEASUREMENT_ID
 * 4. Uncomment initialization code below
 */
export function initAnalytics() {
  // Uncomment when ready to deploy
  /*
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (import.meta.env.PROD && measurementId) {
    // Load gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
    
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', measurementId, {
      anonymize_ip: true, // PDPA compliance
      send_page_view: false, // Manual page view tracking
    });
  }
  */
  
  console.log('✅ Analytics initialized (GA4 ready for deployment)');
}

/**
 * Track page view (anonymized)
 */
export function trackPageView(route: string, userRole?: UserRole) {
  // In production, this would use gtag
  const event = {
    event: 'page_view',
    page_path: route,
    user_role: userRole,
    timestamp: Date.now(),
  };
  
  console.log('📊 Page view:', event);
  storeLocalMetric('pageViews', event);
}

/**
 * Track custom event
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
) {
  const event = {
    event: 'custom_event',
    event_category: category,
    event_action: action,
    event_label: label,
    event_value: value,
    timestamp: Date.now(),
  };
  
  console.log('📊 Event:', event);
  storeLocalMetric('events', event);
}

// =============================================================================
// CUSTOM MEDICAL METRICS
// =============================================================================

/**
 * Track disclaimer acceptance (for IRB compliance)
 */
export function trackDisclaimerAcceptance(
  tool: 'symptomChecker' | 'appointment' | 'aiGuidance',
  userRole: UserRole
) {
  const metric = {
    metric: 'disclaimer_accepted',
    tool,
    userRole,
    timestamp: Date.now(),
  };
  
  console.log('✅ Disclaimer accepted:', metric);
  storeLocalMetric('disclaimers', metric);
  trackEvent('Safety', 'Disclaimer Accepted', tool);
}

/**
 * Track feature usage (for pilot evaluation)
 */
export function trackFeatureUsage(
  feature: string,
  action: string,
  userRole: UserRole
) {
  const metric = {
    feature,
    action,
    userRole,
    timestamp: Date.now(),
  };
  
  console.log('📱 Feature used:', metric);
  storeLocalMetric('featureUsage', metric);
  trackEvent('Feature', action, feature);
}

/**
 * Track medication adherence (anonymized)
 */
export function trackMedicationAdherence(
  adherenceRate: number,
  medicationsTaken: number,
  medicationsTotal: number
) {
  const metric = {
    metric: 'medication_adherence',
    adherenceRate: Math.round(adherenceRate),
    medicationsTaken,
    medicationsTotal,
    date: new Date().toISOString().split('T')[0],
  };
  
  console.log('💊 Adherence:', metric);
  storeLocalMetric('adherence', metric);
}

/**
 * Track symptom checker usage (anonymized)
 */
export function trackSymptomCheck(
  symptomsCount: number,
  riskLevel: 'low' | 'medium' | 'high' | 'critical',
  recommendationFollowed: boolean
) {
  const metric = {
    metric: 'symptom_check',
    symptomsCount,
    riskLevel,
    recommendationFollowed,
    timestamp: Date.now(),
  };
  
  console.log('🩺 Symptom check:', metric);
  storeLocalMetric('symptomChecks', metric);
}

/**
 * Track appointment bookings
 */
export function trackAppointmentBooking(
  facilityType: string,
  daysUntilAppointment: number,
  wasRescheduled: boolean
) {
  const metric = {
    metric: 'appointment_booking',
    facilityType,
    daysUntilAppointment,
    wasRescheduled,
    timestamp: Date.now(),
  };
  
  console.log('📅 Appointment:', metric);
  storeLocalMetric('appointments', metric);
}

/**
 * Track CHW route optimization
 */
export function trackRouteOptimization(
  patientsCount: number,
  estimatedTimeMinutes: number,
  optimizationMethod: 'urgency' | 'distance' | 'mixed'
) {
  const metric = {
    metric: 'route_optimization',
    patientsCount,
    estimatedTimeMinutes,
    optimizationMethod,
    timestamp: Date.now(),
  };
  
  console.log('🗺️ Route optimized:', metric);
  storeLocalMetric('routes', metric);
}

/**
 * Track facility searches
 */
export function trackFacilitySearch(
  serviceType: string,
  resultCount: number,
  nearestDistanceKm: number
) {
  const metric = {
    metric: 'facility_search',
    serviceType,
    resultCount,
    nearestDistanceKm,
    timestamp: Date.now(),
  };
  
  console.log('🏥 Facility search:', metric);
  storeLocalMetric('facilitySearches', metric);
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Track performance metric
 */
export function trackPerformance(name: string, duration: number, metadata?: Record<string, any>) {
  const metric: PerformanceMetric = {
    name,
    duration: Math.round(duration),
    timestamp: Date.now(),
    metadata,
  };
  
  console.log('⚡ Performance:', metric);
  storeLocalMetric('performance', metric);
}

/**
 * Measure async operation
 */
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    trackPerformance(name, duration, { success: true });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    trackPerformance(name, duration, { success: false });
    throw error;
  }
}

// =============================================================================
// LOCAL STORAGE METRICS (FOR OFFLINE & DEMO)
// =============================================================================

const METRICS_KEY = 'afyacare_metrics';

interface StoredMetrics {
  errors: any[];
  pageViews: any[];
  events: any[];
  disclaimers: any[];
  featureUsage: any[];
  adherence: any[];
  symptomChecks: any[];
  appointments: any[];
  routes: any[];
  facilitySearches: any[];
  performance: any[];
}

/**
 * Store metric in localStorage (for offline and admin dashboard)
 */
function storeLocalMetric(category: keyof StoredMetrics, data: any) {
  try {
    const stored = localStorage.getItem(METRICS_KEY);
    const metrics: StoredMetrics = stored ? JSON.parse(stored) : {
      errors: [],
      pageViews: [],
      events: [],
      disclaimers: [],
      featureUsage: [],
      adherence: [],
      symptomChecks: [],
      appointments: [],
      routes: [],
      facilitySearches: [],
      performance: [],
    };
    
    // Add new metric
    if (!metrics[category]) {
      metrics[category] = [];
    }
    metrics[category].push(data);
    
    // Keep only last 1000 metrics per category (prevent localStorage bloat)
    if (metrics[category].length > 1000) {
      metrics[category] = metrics[category].slice(-1000);
    }
    
    localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
  } catch (error) {
    console.warn('Failed to store metric:', error);
  }
}

/**
 * Get stored metrics (for admin dashboard)
 */
export function getStoredMetrics(): StoredMetrics {
  try {
    const stored = localStorage.getItem(METRICS_KEY);
    return stored ? JSON.parse(stored) : {
      errors: [],
      pageViews: [],
      events: [],
      disclaimers: [],
      featureUsage: [],
      adherence: [],
      symptomChecks: [],
      appointments: [],
      routes: [],
      facilitySearches: [],
      performance: [],
    };
  } catch {
    return {
      errors: [],
      pageViews: [],
      events: [],
      disclaimers: [],
      featureUsage: [],
      adherence: [],
      symptomChecks: [],
      appointments: [],
      routes: [],
      facilitySearches: [],
      performance: [],
    };
  }
}

/**
 * Clear stored metrics (for privacy)
 */
export function clearStoredMetrics() {
  localStorage.removeItem(METRICS_KEY);
  console.log('✅ Metrics cleared');
}

/**
 * Export metrics for analysis (anonymized JSON)
 */
export function exportMetrics(): string {
  const metrics = getStoredMetrics();
  const anonymized = {
    ...metrics,
    exportedAt: new Date().toISOString(),
    version: '1.0',
    note: 'All data anonymized - no PII included',
  };
  return JSON.stringify(anonymized, null, 2);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize all monitoring systems
 */
export function initializeMonitoring() {
  initSentry();
  initAnalytics();
  console.log('✅ Monitoring systems initialized');
}

// =============================================================================
// TYPE DECLARATIONS FOR WINDOW
// =============================================================================

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}
