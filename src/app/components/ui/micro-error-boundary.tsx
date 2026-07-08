import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

export class MicroErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MicroErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-4 border border-red-100 bg-red-50 rounded-lg text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">
            {this.props.fallbackMessage || 'Failed to load component.'}
          </span>
          <button
            className="ml-4 text-sm underline opacity-80 hover:opacity-100"
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
