/**
 * Loading States Component for Enhanced UI Feedback
 * Provides consistent loading animations and feedback throughout the app
 */

import { Loader2, Package, Scan, Cloud, DollarSign, Link, Users } from 'lucide-react';
import { Card, CardContent } from './card';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

interface LoadingCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function LoadingCard({ title, description, icon }: LoadingCardProps) {
  return (
    <Card className="notebook-card">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {icon && (
            <div className="flex-shrink-0 text-primary">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <LoadingSpinner size="sm" />
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductLoadingState() {
  return (
    <LoadingCard
      title="Loading products..."
      description="Fetching your inventory database"
      icon={<Package className="w-6 h-6" />}
    />
  );
}

export function ScanningLoadingState() {
  return (
    <LoadingCard
      title="Scanning barcode..."
      description="Processing image with AI vision"
      icon={<Scan className="w-6 h-6" />}
    />
  );
}

export function WeatherLoadingState() {
  return (
    <LoadingCard
      title="Fetching weather data..."
      description="Analyzing demand patterns"
      icon={<Cloud className="w-6 h-6" />}
    />
  );
}

export function AnalysisLoadingState() {
  return (
    <LoadingCard
      title="Analyzing costs..."
      description="Calculating margins and profitability"
      icon={<DollarSign className="w-6 h-6" />}
    />
  );
}

export function QuickBooksLoadingState() {
  return (
    <LoadingCard
      title="Syncing with QuickBooks..."
      description="Connecting to your accounting system"
      icon={<Link className="w-6 h-6" />}
    />
  );
}

export function SupplierLoadingState() {
  return (
    <LoadingCard
      title="Loading supplier data..."
      description="Gathering performance metrics"
      icon={<Users className="w-6 h-6" />}
    />
  );
}

// Skeleton components for smooth transitions
export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center space-x-4 p-4 border rounded-lg">
        <div className="w-12 h-12 bg-gray-300 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}