"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CustomerHealth {
  id: string;
  company: string;
  tier: string;
  healthScore: number;
  status: "green" | "yellow" | "red";
  usage: {
    activeUsers: number;
    workflowsRunning: number;
    featureAdoption: number;
  };
  engagement: {
    supportTickets: number;
    qbrAttendance: boolean;
    responseTime: number;
  };
  value: {
    roiAchieved: boolean;
    goalsMet: boolean;
  };
  satisfaction: {
    nps: number;
    csat: number;
  };
  lastUpdated: string;
}

interface HealthSummary {
  totalCustomers: number;
  avgHealthScore: number;
  distribution: {
    green: { count: number; percentage: number };
    yellow: { count: number; percentage: number };
    red: { count: number; percentage: number };
  };
  target: {
    greenPercentage: number;
    yellowPercentage: number;
    redPercentage: number;
  };
}

export function CustomerHealthDashboard() {
  const [customers, setCustomers] = useState<CustomerHealth[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [historicalTrend, setHistoricalTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await fetch("/api/admin/metrics/customer-health");
      const data = await response.json();
      setCustomers(data.customers || []);
      setSummary(data.summary || null);
      setHistoricalTrend(data.historicalTrend || []);
    } catch (error) {
      console.error("Error fetching health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "green":
        return <Badge className="bg-green-500">Healthy</Badge>;
      case "yellow":
        return <Badge className="bg-yellow-500">At Risk</Badge>;
      case "red":
        return <Badge className="bg-red-500">Critical</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (loading) {
    return <div className="p-6">Loading health data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avgHealthScore}</div>
              <p className="text-xs text-muted-foreground">
                Target: 80+ {summary.avgHealthScore >= 80 ? "✅" : "⚠️"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Healthy Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.distribution.green.count}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.distribution.green.percentage.toFixed(1)}% (Target: {summary.target.greenPercentage}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {summary.distribution.yellow.count}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.distribution.yellow.percentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.distribution.red.count}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.distribution.red.percentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customer List</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Health Distribution Chart */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>Health Score Distribution</CardTitle>
                <CardDescription>Customer health status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: "Healthy", value: summary.distribution.green.count, target: summary.totalCustomers * (summary.target.greenPercentage / 100) },
                    { name: "At Risk", value: summary.distribution.yellow.count, target: summary.totalCustomers * (summary.target.yellowPercentage / 100) },
                    { name: "Critical", value: summary.distribution.red.count, target: summary.totalCustomers * (summary.target.redPercentage / 100) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Current" />
                    <Bar dataKey="target" fill="#94a3b8" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Historical Trend */}
          {historicalTrend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Health Score Trend</CardTitle>
                <CardDescription>Average health score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgHealthScore" stroke="#3b82f6" name="Avg Health Score" />
                    <Line type="monotone" dataKey="greenPercentage" stroke="#10b981" name="Green %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Health Scores</CardTitle>
              <CardDescription>Detailed health metrics for each customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{customer.company}</h3>
                        <p className="text-sm text-muted-foreground">{customer.tier} Tier</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(customer.status)}
                        <div className="text-2xl font-bold">{customer.healthScore}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Active Users</p>
                        <p className="font-medium">{customer.usage.activeUsers}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Workflows</p>
                        <p className="font-medium">{customer.usage.workflowsRunning}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">NPS</p>
                        <p className="font-medium">{customer.satisfaction.nps}/10</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Support Tickets</p>
                        <p className="font-medium">{customer.engagement.supportTickets}/mo</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {historicalTrend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Health Score Trends</CardTitle>
                <CardDescription>Health distribution over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={historicalTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="greenPercentage" stroke="#10b981" name="Healthy %" />
                    <Line type="monotone" dataKey="yellowPercentage" stroke="#eab308" name="At Risk %" />
                    <Line type="monotone" dataKey="redPercentage" stroke="#ef4444" name="Critical %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
