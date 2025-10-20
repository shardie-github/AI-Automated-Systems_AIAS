import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface BusinessMetrics {
  revenue: {
    mrr: number;
    arr: number;
    total: number;
    growth: number;
  };
  customers: {
    total: number;
    active: number;
    new: number;
    churned: number;
    churnRate: number;
  };
  usage: {
    totalWorkflows: number;
    totalExecutions: number;
    activeUsers: number;
    apiCalls: number;
  };
  conversion: {
    trialToPaid: number;
    visitorToTrial: number;
    visitorToPaid: number;
  };
  engagement: {
    avgSessionDuration: number;
    pageViews: number;
    bounceRate: number;
    returnVisitors: number;
  };
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

const BusinessDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock data for demonstration
  const mockMetrics: BusinessMetrics = {
    revenue: {
      mrr: 125000,
      arr: 1500000,
      total: 125000,
      growth: 15.2
    },
    customers: {
      total: 1250,
      active: 1180,
      new: 45,
      churned: 12,
      churnRate: 1.02
    },
    usage: {
      totalWorkflows: 3420,
      totalExecutions: 125000,
      activeUsers: 890,
      apiCalls: 45000
    },
    conversion: {
      trialToPaid: 23.5,
      visitorToTrial: 8.2,
      visitorToPaid: 1.9
    },
    engagement: {
      avgSessionDuration: 12.5,
      pageViews: 45000,
      bounceRate: 35.2,
      returnVisitors: 65.8
    }
  };

  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High Churn Rate',
      message: 'Customer churn rate has increased to 1.02% this month',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      title: 'New Feature Launch',
      message: 'AI Workflow Builder v2.0 has been successfully deployed',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      resolved: true
    },
    {
      id: '3',
      type: 'error',
      title: 'API Rate Limit Exceeded',
      message: 'API rate limit exceeded for 3 customers in the last hour',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resolved: false
    }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 85000, customers: 980 },
    { month: 'Feb', revenue: 92000, customers: 1050 },
    { month: 'Mar', revenue: 98000, customers: 1120 },
    { month: 'Apr', revenue: 105000, customers: 1180 },
    { month: 'May', revenue: 115000, customers: 1220 },
    { month: 'Jun', revenue: 125000, customers: 1250 }
  ];

  const conversionData = [
    { name: 'Visitors', value: 10000, color: '#8884d8' },
    { name: 'Trials', value: 820, color: '#82ca9d' },
    { name: 'Paid', value: 156, color: '#ffc658' }
  ];

  const usageData = [
    { day: 'Mon', workflows: 120, executions: 4500 },
    { day: 'Tue', workflows: 135, executions: 5200 },
    { day: 'Wed', workflows: 150, executions: 5800 },
    { day: 'Thu', workflows: 140, executions: 5600 },
    { day: 'Fri', workflows: 160, executions: 6200 },
    { day: 'Sat', workflows: 80, executions: 3200 },
    { day: 'Sun', workflows: 70, executions: 2800 }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

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

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your AI consultancy performance and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7D
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30D
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90D
          </Button>
          <Button
            variant={timeRange === '1y' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('1y')}
          >
            1Y
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.revenue.mrr || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +{formatPercentage(metrics?.revenue.growth || 0)} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics?.customers.active || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +{metrics?.customers.new || 0} new this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics?.conversion.visitorToPaid || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 text-blue-500 mr-1" />
              Trial to paid: {formatPercentage(metrics?.conversion.trialToPaid || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics?.customers.churnRate || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 text-red-500 mr-1" />
              {metrics?.customers.churned || 0} customers churned
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Metrics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly recurring revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>Active customers over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="customers" stroke="#82ca9d" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage</CardTitle>
                <CardDescription>Workflows and executions per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="workflows" fill="#8884d8" />
                    <Bar dataKey="executions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Metrics</CardTitle>
                <CardDescription>Current usage statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Workflows</span>
                  <span className="text-2xl font-bold">{formatNumber(metrics?.usage.totalWorkflows || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Executions</span>
                  <span className="text-2xl font-bold">{formatNumber(metrics?.usage.totalExecutions || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Users</span>
                  <span className="text-2xl font-bold">{formatNumber(metrics?.usage.activeUsers || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Calls</span>
                  <span className="text-2xl font-bold">{formatNumber(metrics?.usage.apiCalls || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Visitor to customer conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
                <CardDescription>Key conversion metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Visitor to Trial</span>
                    <span className="text-lg font-bold">{formatPercentage(metrics?.conversion.visitorToTrial || 0)}</span>
                  </div>
                  <Progress value={metrics?.conversion.visitorToTrial || 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trial to Paid</span>
                    <span className="text-lg font-bold">{formatPercentage(metrics?.conversion.trialToPaid || 0)}</span>
                  </div>
                  <Progress value={metrics?.conversion.trialToPaid || 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Visitor to Paid</span>
                    <span className="text-lg font-bold">{formatPercentage(metrics?.conversion.visitorToPaid || 0)}</span>
                  </div>
                  <Progress value={metrics?.conversion.visitorToPaid || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border ${
                      alert.resolved ? 'bg-muted/50' : 'bg-background'
                    }`}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{alert.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                          {alert.resolved ? (
                            <Badge variant="secondary">Resolved</Badge>
                          ) : (
                            <Badge variant="destructive">Active</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
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

export default BusinessDashboard;