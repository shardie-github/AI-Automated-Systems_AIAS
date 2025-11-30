"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Heart, AlertTriangle, CheckCircle2, Users } from "lucide-react";

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

const COLORS = {
  green: "#10b981",
  yellow: "#eab308",
  red: "#ef4444",
};

export function CustomerHealthDashboardEnhanced() {
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: any }> = {
      green: {
        label: "Healthy",
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg",
        icon: CheckCircle2,
      },
      yellow: {
        label: "At Risk",
        className: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg",
        icon: AlertTriangle,
      },
      red: {
        label: "Critical",
        className: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg",
        icon: AlertTriangle,
      },
    };

    const variant = variants[status] || variants.green;
    const Icon = variant.icon;

    return (
      <Badge className={variant.className}>
        <Icon className="mr-1 h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-blue-600"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Heart className="h-8 w-8" />
            Customer Health Dashboard
          </h2>
          <p className="text-green-100 text-lg">
            Monitor customer health scores and identify at-risk accounts
          </p>
        </div>
      </motion.div>

      {/* Enhanced Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Average Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{summary.avgHealthScore}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: 80+ {summary.avgHealthScore >= 80 ? "✅" : "⚠️"}
              </p>
              <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${summary.avgHealthScore}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Healthy Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {summary.distribution.green.count}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.distribution.green.percentage.toFixed(1)}% (Target: {summary.target.greenPercentage}%)
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                At Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {summary.distribution.yellow.count}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.distribution.yellow.percentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {summary.distribution.red.count}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.distribution.red.percentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white shadow-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customer List</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Health Distribution Chart */}
          {summary && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Health Score Distribution
                </CardTitle>
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
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {["Healthy", "At Risk", "Critical"].map((name, index) => (
                        <Cell key={name} fill={COLORS[name === "Healthy" ? "green" : name === "At Risk" ? "yellow" : "red"]} />
                      ))}
                    </Bar>
                    <Bar dataKey="target" fill="#94a3b8" radius={[8, 8, 0, 0]} name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Historical Trend */}
          {historicalTrend.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Health Score Trend
                </CardTitle>
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
                    <Line type="monotone" dataKey="avgHealthScore" stroke="#3b82f6" strokeWidth={3} name="Avg Health Score" dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="greenPercentage" stroke="#10b981" strokeWidth={2} name="Healthy %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Customer Health Scores</CardTitle>
              <CardDescription>Detailed health metrics for each customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer, index) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-2 rounded-xl p-6 space-y-3 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-xl">{customer.company}</h3>
                        <p className="text-sm text-muted-foreground">{customer.tier} Tier</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(customer.status)}
                        <div className="text-3xl font-bold" style={{ color: COLORS[customer.status] }}>
                          {customer.healthScore}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs mb-1">Active Users</p>
                        <p className="font-bold text-blue-600">{customer.usage.activeUsers}%</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs mb-1">Workflows</p>
                        <p className="font-bold text-purple-600">{customer.usage.workflowsRunning}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs mb-1">NPS</p>
                        <p className="font-bold text-green-600">{customer.satisfaction.nps}/10</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs mb-1">Support Tickets</p>
                        <p className="font-bold text-amber-600">{customer.engagement.supportTickets}/mo</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {historicalTrend.length > 0 && (
            <Card className="shadow-lg">
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
                    <Line type="monotone" dataKey="greenPercentage" stroke="#10b981" strokeWidth={3} name="Healthy %" dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="yellowPercentage" stroke="#eab308" strokeWidth={2} name="At Risk %" />
                    <Line type="monotone" dataKey="redPercentage" stroke="#ef4444" strokeWidth={2} name="Critical %" />
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
