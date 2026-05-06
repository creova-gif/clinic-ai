/**
 * ErrorBoundary - React Error Boundary Component
 * 
 * SAFETY NET:
 * - Catches JavaScript errors in child components
 * - Prevents white screen of death
 * - Logs errors for debugging
 * - Shows user-friendly fallback UI
 * 
 * USAGE:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// Send errors to the monitoring/Sentry service if configured
function reportError(error: Error, errorInfo: ErrorInfo) {
  import('@/app/utils/monitoring').then((m) => {
    m.logError(error, { componentStack: errorInfo.componentStack ?? '' });
  }).catch(() => {
    // monitoring unavailable — silently ignore
  });
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) this.props.onError(error, errorInfo);

    // Send to error tracking (Sentry via monitoring module)
    reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border-2 border-[#FEE2E2] p-8 text-center">
            {/* Error Icon */}
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: '#FEE2E2' }}
            >
              <AlertTriangle className="w-8 h-8" style={{ color: '#EF4444' }} />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-[#1A1D23] mb-2">
              Samahani, kuna tatizo
            </h1>
            <p className="text-[#6B7280] mb-1">Sorry, something went wrong</p>

            <p className="text-sm text-[#6B7280] mb-6">
              Tumepata hitilafu isiyo ya kawaida. Tafadhali jaribu tena.
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm font-medium text-[#EF4444] cursor-pointer mb-2">
                  🔍 Technical Details (Dev Only)
                </summary>
                <div className="bg-[#FEF2F2] rounded-lg p-4 text-xs text-[#1A1D23] overflow-auto max-h-40">
                  <p className="font-bold mb-2">{this.state.error.toString()}</p>
                  <pre className="whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full h-12 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Jaribu Tena / Try Again</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full h-12 bg-white border-2 border-[#E5E7EB] hover:border-[#D1D5DB] text-[#1A1D23] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                <span>Rudi Nyumbani / Go Home</span>
              </button>
            </div>

            {/* Support Message */}
            <p className="text-xs text-[#6B7280] mt-6">
              Kama tatizo linaendelea, wasiliana na msaada wetu.
              <br />
              If the problem persists, contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary (for functional components)
 * Note: This is a wrapper around the class-based ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
