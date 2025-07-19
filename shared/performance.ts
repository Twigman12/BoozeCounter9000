/**
 * L.O.G. Framework - Performance Monitoring & Observability
 * Resonance v2.1 Implementation
 */

import { logger, PerformanceTracker } from './logger';

export interface ComponentMetrics {
  renderTime: number;
  updateTime: number;
  errorCount: number;
  lastError?: string;
  mountTime: number;
  unmountTime?: number;
}

export interface APIMetrics {
  endpoint: string;
  method: string;
  averageResponseTime: number;
  errorRate: number;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastCallTime: number;
}

export interface SystemMetrics {
  memoryUsage?: number;
  cpuUsage?: number;
  networkLatency?: number;
  activeConnections?: number;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private apiMetrics: Map<string, APIMetrics> = new Map();
  private systemMetrics: SystemMetrics[] = [];
  private alertThresholds = {
    renderTime: 100, // ms
    apiResponseTime: 2000, // ms
    errorRate: 0.05, // 5%
    memoryUsage: 100 * 1024 * 1024 // 100MB
  };

  private constructor() {
    this.startSystemMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Component performance tracking
  recordComponentRender(componentName: string, renderTime: number) {
    const existing = this.componentMetrics.get(componentName) || {
      renderTime: 0,
      updateTime: 0,
      errorCount: 0,
      mountTime: Date.now()
    };

    existing.renderTime = renderTime;
    this.componentMetrics.set(componentName, existing);

    if (renderTime > this.alertThresholds.renderTime) {
      logger.warn(
        'performance' as any,
        `Slow render detected: ${componentName} took ${renderTime}ms`,
        { componentName, renderTime },
        'PerformanceMonitor'
      );
    }
  }

  recordComponentError(componentName: string, error: string) {
    const existing = this.componentMetrics.get(componentName);
    if (existing) {
      existing.errorCount++;
      existing.lastError = error;
      this.componentMetrics.set(componentName, existing);
    }
  }

  // API performance tracking
  recordAPICall(endpoint: string, method: string, responseTime: number, success: boolean) {
    const key = `${method} ${endpoint}`;
    const existing = this.apiMetrics.get(key) || {
      endpoint,
      method,
      averageResponseTime: 0,
      errorRate: 0,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      lastCallTime: 0
    };

    existing.totalCalls++;
    existing.lastCallTime = Date.now();
    
    if (success) {
      existing.successfulCalls++;
    } else {
      existing.failedCalls++;
    }

    // Calculate rolling average response time
    existing.averageResponseTime = (
      (existing.averageResponseTime * (existing.totalCalls - 1) + responseTime) /
      existing.totalCalls
    );

    // Calculate error rate
    existing.errorRate = existing.failedCalls / existing.totalCalls;

    this.apiMetrics.set(key, existing);

    // Performance alerts
    if (responseTime > this.alertThresholds.apiResponseTime) {
      logger.warn(
        'performance' as any,
        `Slow API response: ${key} took ${responseTime}ms`,
        { endpoint, method, responseTime },
        'PerformanceMonitor'
      );
    }

    if (existing.errorRate > this.alertThresholds.errorRate && existing.totalCalls > 10) {
      logger.warn(
        'performance' as any,
        `High API error rate: ${key} has ${(existing.errorRate * 100).toFixed(1)}% error rate`,
        { endpoint, method, errorRate: existing.errorRate },
        'PerformanceMonitor'
      );
    }
  }

  // System monitoring
  private startSystemMonitoring() {
    if (typeof window !== 'undefined') {
      // Client-side monitoring
      setInterval(() => {
        this.collectSystemMetrics();
      }, 30000); // Every 30 seconds
    }
  }

  private collectSystemMetrics() {
    const metrics: SystemMetrics = {
      timestamp: Date.now()
    };

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = memory.usedJSHeapSize;
      
      if (memory.usedJSHeapSize > this.alertThresholds.memoryUsage) {
        logger.warn(
          'performance' as any,
          `High memory usage detected: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          { memoryUsage: memory.usedJSHeapSize },
          'PerformanceMonitor'
        );
      }
    }

    // Network latency estimation
    if (navigator.connection) {
      const connection = navigator.connection as any;
      metrics.networkLatency = connection.rtt;
    }

    this.systemMetrics.push(metrics);

    // Keep only last 100 system metric entries
    if (this.systemMetrics.length > 100) {
      this.systemMetrics.splice(0, this.systemMetrics.length - 100);
    }
  }

  // Getters for metrics
  getComponentMetrics(): Map<string, ComponentMetrics> {
    return new Map(this.componentMetrics);
  }

  getAPIMetrics(): Map<string, APIMetrics> {
    return new Map(this.apiMetrics);
  }

  getSystemMetrics(): SystemMetrics[] {
    return [...this.systemMetrics];
  }

  // Performance summary
  getPerformanceSummary() {
    const slowComponents = Array.from(this.componentMetrics.entries())
      .filter(([_, metrics]) => metrics.renderTime > this.alertThresholds.renderTime)
      .map(([name, metrics]) => ({ name, renderTime: metrics.renderTime }));

    const slowAPIs = Array.from(this.apiMetrics.entries())
      .filter(([_, metrics]) => metrics.averageResponseTime > this.alertThresholds.apiResponseTime)
      .map(([endpoint, metrics]) => ({ 
        endpoint, 
        averageResponseTime: metrics.averageResponseTime,
        errorRate: metrics.errorRate 
      }));

    const highErrorAPIs = Array.from(this.apiMetrics.entries())
      .filter(([_, metrics]) => metrics.errorRate > this.alertThresholds.errorRate && metrics.totalCalls > 10)
      .map(([endpoint, metrics]) => ({ 
        endpoint, 
        errorRate: metrics.errorRate,
        totalCalls: metrics.totalCalls 
      }));

    return {
      slowComponents,
      slowAPIs,
      highErrorAPIs,
      totalComponents: this.componentMetrics.size,
      totalAPIEndpoints: this.apiMetrics.size,
      timestamp: Date.now()
    };
  }

  // Reset metrics
  reset() {
    this.componentMetrics.clear();
    this.apiMetrics.clear();
    this.systemMetrics = [];
    logger.info('system' as any, 'Performance metrics reset', {}, 'PerformanceMonitor');
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React component performance tracking hook
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now();
  
  return {
    onRender: () => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.recordComponentRender(componentName, renderTime);
    },
    onError: (error: string) => {
      performanceMonitor.recordComponentError(componentName, error);
    }
  };
}

// API call wrapper with performance tracking
export async function trackAPICall<T>(
  endpoint: string,
  method: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  let success = false;
  
  try {
    const result = await apiCall();
    success = true;
    return result;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const responseTime = performance.now() - startTime;
    performanceMonitor.recordAPICall(endpoint, method, responseTime, success);
  }
}

// Performance measurement utilities
export function measureFunction<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return ((...args: any[]) => {
    const tracker = new PerformanceTracker(operationName);
    try {
      const result = fn(...args);
      tracker.end({ success: true });
      return result;
    } catch (error) {
      tracker.end({ success: false, error: error.message });
      throw error;
    }
  }) as T;
}

export async function measureAsyncFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): Promise<ReturnType<T>> {
  const tracker = new PerformanceTracker(operationName);
  try {
    const result = await fn();
    tracker.end({ success: true });
    return result;
  } catch (error) {
    tracker.end({ success: false, error: error.message });
    throw error;
  }
}