import { useEffect, useState } from 'react';
import { observabilityService } from '@/lib/observability';
import PerformanceMonitor from '@/components/PerformanceMonitor';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Array<{
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    lastCheck: number;
    details?: Record<string, unknown>;
  }>;
  metrics: {
    totalMetrics: number;
    totalLogs: number;
    performanceMetrics: number;
  };
}

const Health = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = () => {
      const systemHealth = observabilityService.getSystemHealth();
      const metrics = observabilityService.getMetrics();
      const logs = observabilityService.getLogs();
      const performanceMetrics = observabilityService.getPerformanceMetrics();

      setHealth({
        status: systemHealth.status,
        services: systemHealth.services,
        metrics: {
          totalMetrics: Array.from(metrics.values()).reduce((sum, arr) => sum + arr.length, 0),
          totalLogs: logs.length,
          performanceMetrics: performanceMetrics.length
        }
      });
      setLoading(false);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading health status...</div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Failed to load health status</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Health Dashboard</h1>
        
        {/* Overall Status */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-4 h-4 rounded-full ${getStatusBgColor(health.status)}`}></div>
            <h2 className="text-2xl font-semibold">Overall Status: 
              <span className={`ml-2 ${getStatusColor(health.status)}`}>
                {health.status.toUpperCase()}
              </span>
            </h2>
          </div>
        </div>

        {/* Services Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {health.services.map((service) => (
            <div key={service.service} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize">{service.service}</h3>
                <div className={`w-3 h-3 rounded-full ${getStatusBgColor(service.status)}`}></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={getStatusColor(service.status)}>
                    {service.status.toUpperCase()}
                  </span>
                </div>
                {service.responseTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Response Time:</span>
                    <span>{service.responseTime}ms</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Check:</span>
                  <span>{new Date(service.lastCheck).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics Summary */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Metrics Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{health.metrics.totalMetrics}</div>
              <div className="text-gray-400">Total Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{health.metrics.totalLogs}</div>
              <div className="text-gray-400">Total Logs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{health.metrics.performanceMetrics}</div>
              <div className="text-gray-400">Performance Metrics</div>
            </div>
          </div>
        </div>

        {/* Performance Monitor */}
        <div className="mt-8">
          <PerformanceMonitor />
        </div>

        {/* Prometheus Metrics Export */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Prometheus Metrics Export</h3>
          <div className="bg-gray-900 rounded p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {observabilityService.exportPrometheusMetrics()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;
