/**
 * L.O.G. Framework - Logging Infrastructure & Observability Systems
 * Resonance v2.1 Implementation
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum LogCategory {
  SYSTEM = 'system',
  USER_ACTION = 'user_action',
  API_REQUEST = 'api_request',
  DATABASE = 'database',
  INVENTORY = 'inventory',
  AUTHENTICATION = 'auth',
  INTEGRATION = 'integration',
  PERFORMANCE = 'performance',
  ERROR = 'error'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  source: 'client' | 'server';
  component?: string;
  action?: string;
  duration?: number;
  stackTrace?: string;
}

export interface PerformanceMetrics {
  operationName: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private correlationId: string = '';
  private sessionId: string = '';
  private userId: string = '';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setContext(correlationId?: string, sessionId?: string, userId?: string) {
    this.correlationId = correlationId || this.generateCorrelationId();
    this.sessionId = sessionId || '';
    this.userId = userId || '';
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, any>,
    component?: string,
    action?: string,
    duration?: number,
    stackTrace?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
      userId: this.userId,
      sessionId: this.sessionId,
      correlationId: this.correlationId,
      source: typeof window !== 'undefined' ? 'client' : 'server',
      component,
      action,
      duration,
      stackTrace
    };
  }

  private log(entry: LogEntry) {
    // Console output with color coding
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.CRITICAL]: '\x1b[35m' // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level];
    
    console.log(
      `${color}[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.category}]${reset} ${entry.message}`,
      entry.metadata ? JSON.stringify(entry.metadata, null, 2) : ''
    );

    // In production, send to external logging service
    this.sendToExternalService(entry);
  }

  private sendToExternalService(entry: LogEntry) {
    // Implementation for external logging service (e.g., DataDog, CloudWatch)
    // For now, store in localStorage for client-side persistence
    if (typeof window !== 'undefined') {
      try {
        const logs = JSON.parse(localStorage.getItem('resonance_logs') || '[]');
        logs.push(entry);
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
          logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('resonance_logs', JSON.stringify(logs));
      } catch (error) {
        console.warn('Failed to persist log to localStorage:', error);
      }
    }
  }

  // Core logging methods
  debug(category: LogCategory, message: string, metadata?: Record<string, any>, component?: string) {
    this.log(this.createLogEntry(LogLevel.DEBUG, category, message, metadata, component));
  }

  info(category: LogCategory, message: string, metadata?: Record<string, any>, component?: string) {
    this.log(this.createLogEntry(LogLevel.INFO, category, message, metadata, component));
  }

  warn(category: LogCategory, message: string, metadata?: Record<string, any>, component?: string) {
    this.log(this.createLogEntry(LogLevel.WARN, category, message, metadata, component));
  }

  error(category: LogCategory, message: string, error?: Error, metadata?: Record<string, any>, component?: string) {
    const stackTrace = error?.stack;
    const errorMetadata = {
      ...metadata,
      errorName: error?.name,
      errorMessage: error?.message
    };
    
    this.log(this.createLogEntry(LogLevel.ERROR, category, message, errorMetadata, component, undefined, undefined, stackTrace));
  }

  critical(category: LogCategory, message: string, error?: Error, metadata?: Record<string, any>, component?: string) {
    const stackTrace = error?.stack;
    const errorMetadata = {
      ...metadata,
      errorName: error?.name,
      errorMessage: error?.message
    };
    
    this.log(this.createLogEntry(LogLevel.CRITICAL, category, message, errorMetadata, component, undefined, undefined, stackTrace));
  }

  // User action tracking
  userAction(action: string, component: string, metadata?: Record<string, any>) {
    this.info(LogCategory.USER_ACTION, `User performed: ${action}`, metadata, component);
  }

  // API request tracking
  apiRequest(method: string, endpoint: string, duration: number, statusCode: number, metadata?: Record<string, any>) {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(this.createLogEntry(
      level,
      LogCategory.API_REQUEST,
      `${method} ${endpoint} - ${statusCode}`,
      { statusCode, ...metadata },
      'api',
      `${method} ${endpoint}`,
      duration
    ));
  }

  // Performance tracking
  performance(metrics: PerformanceMetrics) {
    this.info(
      LogCategory.PERFORMANCE,
      `Performance: ${metrics.operationName}`,
      {
        duration: metrics.duration,
        ...metrics.metadata
      },
      'performance'
    );
  }

  // Database operation tracking
  dbOperation(operation: string, table?: string, duration?: number, metadata?: Record<string, any>) {
    this.info(
      LogCategory.DATABASE,
      `DB ${operation}${table ? ` on ${table}` : ''}`,
      { table, ...metadata },
      'database'
    );
  }

  // Inventory-specific logging
  inventoryAction(action: string, productId?: number, quantity?: number, metadata?: Record<string, any>) {
    this.info(
      LogCategory.INVENTORY,
      `Inventory: ${action}`,
      { productId, quantity, ...metadata },
      'inventory'
    );
  }
}

// Singleton instance
export const logger = Logger.getInstance();

// Performance measurement utility
export class PerformanceTracker {
  private startTime: number;
  private operationName: string;
  private metadata: Record<string, any>;

  constructor(operationName: string, metadata?: Record<string, any>) {
    this.operationName = operationName;
    this.metadata = metadata || {};
    this.startTime = performance.now();
  }

  end(additionalMetadata?: Record<string, any>): number {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    
    logger.performance({
      operationName: this.operationName,
      startTime: this.startTime,
      endTime,
      duration,
      metadata: { ...this.metadata, ...additionalMetadata }
    });

    return duration;
  }
}

// Decorator for automatic performance tracking
export function trackPerformance(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const trackingName = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const tracker = new PerformanceTracker(trackingName, { args: args.length });
      
      try {
        const result = await originalMethod.apply(this, args);
        tracker.end({ success: true });
        return result;
      } catch (error) {
        tracker.end({ success: false, error: error.message });
        throw error;
      }
    };

    return descriptor;
  };
}

// Error boundary logging utility
export function logError(error: Error, context: string, metadata?: Record<string, any>) {
  logger.error(LogCategory.ERROR, `Error in ${context}: ${error.message}`, error, metadata);
}

// Audit trail utility
export function auditTrail(action: string, resourceType: string, resourceId: string, changes?: Record<string, any>) {
  logger.info(
    LogCategory.USER_ACTION,
    `Audit: ${action} ${resourceType}`,
    {
      resourceType,
      resourceId,
      changes,
      auditTrail: true
    },
    'audit'
  );
}