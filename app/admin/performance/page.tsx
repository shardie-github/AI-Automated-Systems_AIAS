/**
 * Performance Monitoring Dashboard
 * 
 * Displays real-time performance metrics including:
 * - API response times
 * - Database query performance
 * - Cache hit rates
 * - Error rates
 * - Core Web Vitals
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceMetrics {
  api: {
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
    requestsPerMinute: number;
  };
  database: {
    avgQueryTime: number;
    slowQueries: number;
    connectionPoolUsage: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    totalRequests: number;
  };
  webVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('1h');

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  async function fetchMetrics() {
    try {
      const response = await fetch(`/api/admin/metrics?range=${timeRange}`);
      const data = await response.json();
      setMetrics(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Performance Dashboard</h1>
        <div className="text-center py-12">Loading metrics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Performance Dashboard</h1>
        <div className="text-center py-12 text-red-500">Failed to load metrics</div>
      </div>
    );
  }

  const apiData = [
    { name: 'P50', value: metrics.api.p50 },
    { name: 'P95', value: metrics.api.p95 },
    { name: 'P99', value: metrics.api.p99 },
  ];

  const cacheData = [
    { name: 'Hit Rate', value: metrics.cache.hitRate },
    { name: 'Miss Rate', value: metrics.cache.missRate },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d')}
          className="px-4 py-2 border rounded"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API P95 Latency</CardTitle>
                <CardDescription>95th percentile response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics.api.p95.toFixed(0)}ms
                </div>
                <div className={`text-sm mt-2 ${metrics.api.p95 < 500 ? 'text-green-600' : metrics.api.p95 < 1000 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.api.p95 < 500 ? 'Excellent' : metrics.api.p95 < 1000 ? 'Good' : 'Needs Attention'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>Percentage of failed requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(metrics.api.errorRate * 100).toFixed(2)}%
                </div>
                <div className={`text-sm mt-2 ${metrics.api.errorRate < 0.01 ? 'text-green-600' : metrics.api.errorRate < 0.05 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.api.errorRate < 0.01 ? 'Excellent' : metrics.api.errorRate < 0.05 ? 'Good' : 'Needs Attention'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Hit Rate</CardTitle>
                <CardDescription>Percentage of cache hits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(metrics.cache.hitRate * 100).toFixed(1)}%
                </div>
                <div className={`text-sm mt-2 ${metrics.cache.hitRate > 0.7 ? 'text-green-600' : metrics.cache.hitRate > 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.cache.hitRate > 0.7 ? 'Excellent' : metrics.cache.hitRate > 0.5 ? 'Good' : 'Needs Improvement'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requests/Min</CardTitle>
                <CardDescription>Average requests per minute</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics.api.requestsPerMinute.toFixed(0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Response Times</CardTitle>
              <CardDescription>Latency percentiles</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={apiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>P50 Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.api.p50.toFixed(0)}ms</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>P95 Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.api.p95.toFixed(0)}ms</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>P99 Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.api.p99.toFixed(0)}ms</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Avg Query Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.database.avgQueryTime.toFixed(0)}ms</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Slow Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.database.slowQueries}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Connection Pool Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(metrics.database.connectionPoolUsage * 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>Hit vs Miss Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cacheData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Cache Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.cache.totalRequests.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(metrics.cache.hitRate * 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="web-vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>LCP</CardTitle>
                <CardDescription>Largest Contentful Paint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.webVitals.lcp.toFixed(0)}ms</div>
                <div className={`text-sm mt-2 ${metrics.webVitals.lcp < 2500 ? 'text-green-600' : metrics.webVitals.lcp < 4000 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.webVitals.lcp < 2500 ? 'Good' : metrics.webVitals.lcp < 4000 ? 'Needs Improvement' : 'Poor'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>FID</CardTitle>
                <CardDescription>First Input Delay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.webVitals.fid.toFixed(0)}ms</div>
                <div className={`text-sm mt-2 ${metrics.webVitals.fid < 100 ? 'text-green-600' : metrics.webVitals.fid < 300 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.webVitals.fid < 100 ? 'Good' : metrics.webVitals.fid < 300 ? 'Needs Improvement' : 'Poor'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>CLS</CardTitle>
                <CardDescription>Cumulative Layout Shift</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.webVitals.cls.toFixed(3)}</div>
                <div className={`text-sm mt-2 ${metrics.webVitals.cls < 0.1 ? 'text-green-600' : metrics.webVitals.cls < 0.25 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.webVitals.cls < 0.1 ? 'Good' : metrics.webVitals.cls < 0.25 ? 'Needs Improvement' : 'Poor'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
