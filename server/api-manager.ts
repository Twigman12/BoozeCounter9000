interface ApiConfig {
  key: string;
  rateLimit: number;
  cacheTTL: number;
  retryAttempts: number;
}

interface ApiUsageStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastUsed: Date;
  rateLimitReached: boolean;
}

class ApiKeyManager {
  private usage: Map<string, ApiUsageStats> = new Map();
  private rateLimitWindow: Map<string, number[]> = new Map();

  getConfig(service: string): ApiConfig {
    const environment = process.env.NODE_ENV || 'development';
    
    const configs = {
      weather: {
        development: {
          key: process.env.WEATHER_API_KEY || '',
          rateLimit: 60, // calls per hour
          cacheTTL: 5 * 60 * 1000, // 5 minutes
          retryAttempts: 2
        },
        production: {
          key: process.env.WEATHER_API_KEY || '',
          rateLimit: 800, // leave buffer under 1000 limit
          cacheTTL: 10 * 60 * 1000, // 10 minutes
          retryAttempts: 3
        }
      }
    };

    return configs[service as keyof typeof configs]?.[environment as keyof typeof configs.weather] || configs.weather.development;
  }

  checkRateLimit(service: string): boolean {
    const config = this.getConfig(service);
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    // Get calls in the last hour
    const calls = this.rateLimitWindow.get(service) || [];
    const recentCalls = calls.filter(timestamp => timestamp > hourAgo);
    
    // Update the window
    this.rateLimitWindow.set(service, recentCalls);
    
    return recentCalls.length < config.rateLimit;
  }

  recordApiCall(service: string, success: boolean): void {
    const now = Date.now();
    
    // Update rate limit window
    const calls = this.rateLimitWindow.get(service) || [];
    calls.push(now);
    this.rateLimitWindow.set(service, calls);
    
    // Update usage stats
    const stats = this.usage.get(service) || {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      lastUsed: new Date(),
      rateLimitReached: false
    };
    
    stats.totalCalls++;
    if (success) {
      stats.successfulCalls++;
    } else {
      stats.failedCalls++;
    }
    stats.lastUsed = new Date();
    stats.rateLimitReached = !this.checkRateLimit(service);
    
    this.usage.set(service, stats);
  }

  getUsageStats(service: string): ApiUsageStats | null {
    return this.usage.get(service) || null;
  }

  validateApiKey(service: string): boolean {
    const config = this.getConfig(service);
    return config.key.length > 0;
  }

  maskApiKey(key: string): string {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  }
}

export const apiManager = new ApiKeyManager();

// Security utilities
export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>'"&]/g, '');
};

export const logApiUsage = (service: string, endpoint: string, status: number): void => {
  const timestamp = new Date().toISOString();
  console.log(`[API] ${timestamp} ${service}:${endpoint} - Status: ${status}`);
};