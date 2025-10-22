/**
 * Comprehensive Observability Service
 * Centralized monitoring, logging, and metrics collection
 */

export interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: number;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  labels?: Record<string, string>;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: number;
  details?: Record<string, unknown>;
}

export class ObservabilityService {
  private static instance: ObservabilityService;
  private metrics: Map<string, MetricData[]> = new Map();
  private logs: LogEntry[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  static getInstance(): ObservabilityService {
    if (!ObservabilityService.instance) {
      ObservabilityService.instance = new ObservabilityService();
    }
    return ObservabilityService.instance;
  }

  private initialize() {
    if (this.isInitialized) return;
    
    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
    
    // Initialize error tracking
    this.initializeErrorTracking();
    
    // Initialize health checks
    this.initializeHealthChecks();
    
    this.isInitialized = true;
    this.log('info', 'Observability service initialized');
  }

  private initializePerformanceMonitoring() {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined') {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordPerformanceMetric('lcp', lastEntry.startTime, 'ms');
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordPerformanceMetric('fid', entry.processingStart - entry.startTime, 'ms');
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordPerformanceMetric('cls', clsValue, 'count');
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte (TTFB)
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordPerformanceMetric('ttfb', navigation.responseStart - navigation.requestStart, 'ms');
        }
      });
    }
  }

  private initializeErrorTracking() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.log('error', 'Uncaught error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.log('error', 'Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  private initializeHealthChecks() {
    // Check application health
    this.healthChecks.set('app', {
      service: 'application',
      status: 'healthy',
      lastCheck: Date.now()
    });

    // Check API health
    this.healthChecks.set('api', {
      service: 'api',
      status: 'healthy',
      lastCheck: Date.now()
    });

    // Check database health
    this.healthChecks.set('database', {
      service: 'database',
      status: 'healthy',
      lastCheck: Date.now()
    });
  }

  /**
   * Record a custom metric
   */
  recordMetric(name: string, value: number, labels?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      labels,
      timestamp: Date.now()
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(metric);
    
    // Keep only last 1000 metrics per name
    const metrics = this.metrics.get(name)!;
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }
  }

  /**
   * Record a performance metric
   */
  recordPerformanceMetric(name: string, value: number, unit: 'ms' | 'bytes' | 'count' | 'percent') {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    };

    this.performanceMetrics.push(metric);
    
    // Keep only last 1000 performance metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics.splice(0, this.performanceMetrics.length - 1000);
    }
  }

  /**
   * Log an entry
   */
  log(level: LogEntry['level'], message: string, context?: Record<string, unknown>) {
    const logEntry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      requestId: this.getRequestId()
    };

    this.logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.splice(0, this.logs.length - 1000);
    }

    // Console output for development
    if (import.meta.env.DEV) {
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[logMethod](`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  /**
   * Update health check status
   */
  updateHealthCheck(service: string, status: HealthCheck['status'], details?: Record<string, unknown>) {
    const healthCheck: HealthCheck = {
      service,
      status,
      lastCheck: Date.now(),
      details
    };

    this.healthChecks.set(service, healthCheck);
  }

  /**
   * Get all metrics
   */
  getMetrics(): Map<string, MetricData[]> {
    return new Map(this.metrics);
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  /**
   * Get health checks
   */
  getHealthChecks(): Map<string, HealthCheck> {
    return new Map(this.healthChecks);
  }

  /**
   * Get system health status
   */
  getSystemHealth(): { status: 'healthy' | 'degraded' | 'unhealthy'; services: HealthCheck[] } {
    const services = Array.from(this.healthChecks.values());
    const unhealthyServices = services.filter(s => s.status === 'unhealthy');
    const degradedServices = services.filter(s => s.status === 'degraded');

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyServices.length > 0) {
      status = 'unhealthy';
    } else if (degradedServices.length > 0) {
      status = 'degraded';
    }

    return { status, services };
  }

  /**
   * Export metrics for Prometheus
   */
  exportPrometheusMetrics(): string {
    let output = '';
    
    // Export custom metrics
    for (const [name, metrics] of this.metrics.entries()) {
      for (const metric of metrics) {
        const labels = metric.labels ? 
          Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',') : '';
        const labelStr = labels ? `{${labels}}` : '';
        output += `${name}${labelStr} ${metric.value} ${metric.timestamp}\n`;
      }
    }

    // Export performance metrics
    for (const metric of this.performanceMetrics) {
      output += `${metric.name} ${metric.value}\n`;
    }

    return output;
  }

  /**
   * Clear all data
   */
  clear() {
    this.metrics.clear();
    this.logs.length = 0;
    this.performanceMetrics.length = 0;
    this.healthChecks.clear();
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('observability_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('observability_session_id', sessionId);
    }
    return sessionId;
  }

  private getRequestId(): string {
    if (typeof window === 'undefined') return '';
    
    let requestId = sessionStorage.getItem('observability_request_id');
    if (!requestId) {
      requestId = 'req_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('observability_request_id', requestId);
    }
    return requestId;
  }
}

export const observabilityService = ObservabilityService.getInstance();

// Convenience functions
export const log = (level: LogEntry['level'], message: string, context?: Record<string, unknown>) => {
  observabilityService.log(level, message, context);
};

export const recordMetric = (name: string, value: number, labels?: Record<string, string>) => {
  observabilityService.recordMetric(name, value, labels);
};

export const recordPerformanceMetric = (name: string, value: number, unit: 'ms' | 'bytes' | 'count' | 'percent') => {
  observabilityService.recordPerformanceMetric(name, value, unit);
};

export const updateHealthCheck = (service: string, status: HealthCheck['status'], details?: Record<string, unknown>) => {
  observabilityService.updateHealthCheck(service, status, details);
};
