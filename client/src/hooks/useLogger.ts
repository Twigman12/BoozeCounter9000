/**
 * L.O.G. Framework - Client-side Logging Hook
 * Resonance v2.1 Implementation
 */

import { useEffect, useCallback, useRef } from 'react';
import { logger, LogCategory, PerformanceTracker } from '@shared/logger';

export function useLogger(componentName: string) {
  const renderStartTime = useRef<number>(performance.now());
  const mountTime = useRef<number>(Date.now());

  useEffect(() => {
    // Log component mount
    logger.info(
      LogCategory.SYSTEM,
      `Component mounted: ${componentName}`,
      { mountTime: mountTime.current },
      componentName
    );

    return () => {
      // Log component unmount
      logger.info(
        LogCategory.SYSTEM,
        `Component unmounted: ${componentName}`,
        { 
          mountTime: mountTime.current,
          unmountTime: Date.now(),
          lifespan: Date.now() - mountTime.current
        },
        componentName
      );
    };
  }, [componentName]);

  const logUserAction = useCallback((action: string, metadata?: Record<string, any>) => {
    logger.userAction(action, componentName, metadata);
  }, [componentName]);

  const logError = useCallback((error: Error, context: string, metadata?: Record<string, any>) => {
    logger.error(
      LogCategory.ERROR,
      `Error in ${componentName}.${context}: ${error.message}`,
      error,
      metadata,
      componentName
    );
  }, [componentName]);

  const logPerformance = useCallback((operationName: string, duration: number, metadata?: Record<string, any>) => {
    logger.performance({
      operationName: `${componentName}.${operationName}`,
      startTime: performance.now() - duration,
      endTime: performance.now(),
      duration,
      metadata
    });
  }, [componentName]);

  const trackOperation = useCallback((operationName: string, metadata?: Record<string, any>) => {
    return new PerformanceTracker(`${componentName}.${operationName}`, metadata);
  }, [componentName]);

  const logRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    logger.debug(
      LogCategory.PERFORMANCE,
      `Component rendered: ${componentName}`,
      { renderTime },
      componentName
    );
    renderStartTime.current = performance.now();
  }, [componentName]);

  return {
    logUserAction,
    logError,
    logPerformance,
    trackOperation,
    logRender
  };
}

export function useAPILogger() {
  const logAPICall = useCallback(async <T>(
    endpoint: string,
    method: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const tracker = new PerformanceTracker(`API.${method}.${endpoint}`, metadata);
    
    try {
      const result = await operation();
      const duration = tracker.end({ success: true, endpoint, method });
      
      logger.apiRequest(method, endpoint, duration, 200, metadata);
      return result;
    } catch (error: any) {
      const duration = tracker.end({ success: false, endpoint, method, error: error.message });
      
      logger.apiRequest(method, endpoint, duration, error.status || 500, {
        ...metadata,
        error: error.message
      });
      throw error;
    }
  }, []);

  return { logAPICall };
}