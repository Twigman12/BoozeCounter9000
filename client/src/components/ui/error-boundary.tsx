/**
 * Error Boundary Component for Enhanced Stability
 * Catches JavaScript errors and provides graceful fallbacks
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-screen notebook-bg flex items-center justify-center p-4">
      <Card className="notebook-card max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span>Something went wrong</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Booze Counter 9000 encountered an unexpected error. This has been logged for our development team.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs font-mono text-gray-700">
              {error.message}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={retry} 
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Specialized error boundaries for different components
export function ProductErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={({ error, retry }) => (
      <Card className="notebook-card">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h3 className="text-lg font-semibold">Product Loading Error</h3>
            <p className="text-sm text-muted-foreground">
              Unable to load product data. Please check your connection and try again.
            </p>
            <Button onClick={retry} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )}>
      {children}
    </ErrorBoundary>
  );
}

export function ScannerErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={({ error, retry }) => (
      <Card className="notebook-card">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h3 className="text-lg font-semibold">Scanner Error</h3>
            <p className="text-sm text-muted-foreground">
              Camera access failed. Please check permissions and try again.
            </p>
            <Button onClick={retry} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Scanner
            </Button>
          </div>
        </CardContent>
      </Card>
    )}>
      {children}
    </ErrorBoundary>
  );
}

export function NetworkErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={({ error, retry }) => (
      <Card className="notebook-card">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h3 className="text-lg font-semibold">Network Error</h3>
            <p className="text-sm text-muted-foreground">
              Unable to connect to the server. Please check your internet connection.
            </p>
            <Button onClick={retry} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    )}>
      {children}
    </ErrorBoundary>
  );
}