/**
 * Advanced Analytics Dashboard
 * Revenue analytics, usage trends, and comprehensive reporting
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Scatter,
  ScatterChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  Zap, 
  BarChart3, 
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Eye,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  CreditCard,
  Bot,
  Workflow,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';
import { RevenueStream, UsageMetrics, PlatformAnalytics } from '@/types/platform';

interface AnalyticsDashboardProps {
  tenantId?: string;
  isAdmin?: boolean;
}

interface RevenueData {
  date: string;
  revenue: number;
  subscriptions: number;
  usage: number;
  oneTime: number;
  commissions: number;
}

interface UsageData {
  date: string;
  workflows: number;
  executions: number;
  apiCalls: number;
  aiProcessing: number;
  storage: number;
  users: number;
}

interface ConversionData {
  stage: string;
  users: number;
  conversion: number;
  revenue: number;
}

interface GeographicData {
  country: string;
  users: number;
  revenue: number;
  growth: number;
}

interface CohortData {
  cohort: string;
  users: number;
  retention: number[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  tenantId,
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalytics | null>(null);
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [tenantId, dateRange, timeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockRevenueData: RevenueData[] = generateRevenueData();
      const mockUsageData: UsageData[] = generateUsageData();
      const mockPlatformAnalytics: PlatformAnalytics = {
        totalTenants: 1250,
        activeTenants: 1180,
        totalRevenue: 125000,
        monthlyRecurringRevenue: 125000,
        averageRevenuePerUser: 105.93,
        churnRate: 2.1,
        customerAcquisitionCost: 185,
        lifetimeValue: 2840,
        netPromoterScore: 72
      };
      const mockConversionData: ConversionData[] = [
        { stage: 'Visitors', users: 10000, conversion: 100, revenue: 0 },
        { stage: 'Signups', users: 500, conversion: 5, revenue: 0 },
        { stage: 'Trials', users: 200, conversion: 2, revenue: 0 },
        { stage: 'Paid', users: 80, conversion: 0.8, revenue: 8000 },
        { stage: 'Enterprise', users: 20, conversion: 0.2, revenue: 20000 }
      ];
      const mockGeographicData: GeographicData[] = [
        { country: 'United States', users: 450, revenue: 45000, growth: 12.5 },
        { country: 'United Kingdom', users: 180, revenue: 18000, growth: 8.3 },
        { country: 'Canada', users: 120, revenue: 12000, growth: 15.2 },
        { country: 'Germany', users: 95, revenue: 9500, growth: 6.7 },
        { country: 'Australia', users: 75, revenue: 7500, growth: 18.9 }
      ];
      const mockCohortData: CohortData[] = [
        { cohort: 'Jan 2024', users: 100, retention: [100, 85, 78, 72, 68, 65, 62, 60, 58, 56, 54, 52] },
        { cohort: 'Feb 2024', users: 120, retention: [100, 88, 82, 76, 71, 67, 64, 61, 59, 57, 55, 53] },
        { cohort: 'Mar 2024', users: 140, retention: [100, 90, 85, 80, 75, 71, 68, 65, 63, 61, 59, 57] }
      ];

      setRevenueData(mockRevenueData);
      setUsageData(mockUsageData);
      setPlatformAnalytics(mockPlatformAnalytics);
      setConversionData(mockConversionData);
      setGeographicData(mockGeographicData);
      setCohortData(mockCohortData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRevenueData = (): RevenueData[] => {
    const data: RevenueData[] = [];
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 2000,
        subscriptions: Math.floor(Math.random() * 2000) + 1000,
        usage: Math.floor(Math.random() * 1000) + 500,
        oneTime: Math.floor(Math.random() * 500) + 200,
        commissions: Math.floor(Math.random() * 300) + 100
      });
    }
    
    return data;
  };

  const generateUsageData = (): UsageData[] => {
    const data: UsageData[] = [];
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        workflows: Math.floor(Math.random() * 50) + 20,
        executions: Math.floor(Math.random() * 1000) + 500,
        apiCalls: Math.floor(Math.random() * 10000) + 5000,
        aiProcessing: Math.floor(Math.random() * 100) + 50,
        storage: Math.floor(Math.random() * 10) + 5,
        users: Math.floor(Math.random() * 20) + 10
      });
    }
    
    return data;
  };

  const getTotalRevenue = () => {
    return revenueData.reduce((sum, day) => sum + day.revenue, 0);
  };

  const getRevenueGrowth = () => {
    if (revenueData.length < 2) return 0;
    const current = revenueData[revenueData.length - 1].revenue;
    const previous = revenueData[revenueData.length - 2].revenue;
    return ((current - previous) / previous) * 100;
  };

  const getTotalUsage = () => {
    return usageData.reduce((sum, day) => sum + day.executions, 0);
  };

  const getUsageGrowth = () => {
    if (usageData.length < 2) return 0;
    const current = usageData[usageData.length - 1].executions;
    const previous = usageData[usageData.length - 2].executions;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(getTotalRevenue())}</p>
                    <div className="flex items-center mt-2">
                      {getRevenueGrowth() >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm ${getRevenueGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(getRevenueGrowth()).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Executions</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(getTotalUsage())}</p>
                    <div className="flex items-center mt-2">
                      {getUsageGrowth() >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm ${getUsageGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(getUsageGrowth()).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(usageData[usageData.length - 1]?.users || 0)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+12.5%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{platformAnalytics?.churnRate || 0}%</p>
                    <div className="flex items-center mt-2">
                      <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">-0.3%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Activity className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Usage Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="executions" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="workflows" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Platform Analytics (Admin only) */}
          {isAdmin && platformAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Platform Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{formatNumber(platformAnalytics.totalTenants)}</div>
                    <div className="text-sm text-gray-600">Total Tenants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{formatNumber(platformAnalytics.activeTenants)}</div>
                    <div className="text-sm text-gray-600">Active Tenants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{formatCurrency(platformAnalytics.monthlyRecurringRevenue)}</div>
                    <div className="text-sm text-gray-600">MRR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{platformAnalytics.netPromoterScore}</div>
                    <div className="text-sm text-gray-600">NPS Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Bar dataKey="subscriptions" stackId="a" fill="#3B82F6" name="Subscriptions" />
                  <Bar dataKey="usage" stackId="a" fill="#10B981" name="Usage-based" />
                  <Bar dataKey="oneTime" stackId="a" fill="#F59E0B" name="One-time" />
                  <Bar dataKey="commissions" stackId="a" fill="#EF4444" name="Commissions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(revenueData.reduce((sum, day) => sum + day.subscriptions, 0))}
                </div>
                <div className="text-sm text-gray-600">Subscriptions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(revenueData.reduce((sum, day) => sum + day.usage, 0))}
                </div>
                <div className="text-sm text-gray-600">Usage-based</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(revenueData.reduce((sum, day) => sum + day.oneTime, 0))}
                </div>
                <div className="text-sm text-gray-600">One-time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(revenueData.reduce((sum, day) => sum + day.commissions, 0))}
                </div>
                <div className="text-sm text-gray-600">Commissions</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Usage Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="executions" stroke="#3B82F6" strokeWidth={2} name="Executions" />
                  <Line type="monotone" dataKey="workflows" stroke="#10B981" strokeWidth={2} name="Workflows" />
                  <Line type="monotone" dataKey="apiCalls" stroke="#F59E0B" strokeWidth={2} name="API Calls" />
                  <Line type="monotone" dataKey="aiProcessing" stroke="#8B5CF6" strokeWidth={2} name="AI Processing" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(usageData.reduce((sum, day) => sum + day.executions, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Executions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(usageData.reduce((sum, day) => sum + day.workflows, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Workflows</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatNumber(usageData.reduce((sum, day) => sum + day.apiCalls, 0))}
                </div>
                <div className="text-sm text-gray-600">API Calls</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(usageData.reduce((sum, day) => sum + day.aiProcessing, 0))}
                </div>
                <div className="text-sm text-gray-600">AI Processing (min)</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cohort Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Cohort Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cohort</th>
                      <th className="text-right p-2">Users</th>
                      {Array.from({ length: 12 }, (_, i) => (
                        <th key={i} className="text-right p-2">Month {i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort, index) => (
                      <tr key={cohort.cohort} className="border-b">
                        <td className="p-2 font-medium">{cohort.cohort}</td>
                        <td className="p-2 text-right">{cohort.users}</td>
                        {cohort.retention.map((retention, monthIndex) => (
                          <td key={monthIndex} className="p-2 text-right">
                            <div className={`inline-block px-2 py-1 rounded text-xs ${
                              retention >= 80 ? 'bg-green-100 text-green-800' :
                              retention >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {retention}%
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={conversionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {conversionData.map((stage, index) => (
              <Card key={stage.stage}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stage.users}</div>
                  <div className="text-sm text-gray-600">{stage.stage}</div>
                  <div className="text-xs text-gray-500 mt-1">{stage.conversion}% conversion</div>
                  {index > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      {((stage.users / conversionData[index - 1].users) * 100).toFixed(1)}% of previous
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{country.country}</div>
                        <div className="text-sm text-gray-600">{formatNumber(country.users)} users</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(country.revenue)}</div>
                      <div className={`text-sm ${country.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {country.growth >= 0 ? '+' : ''}{country.growth}% growth
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;