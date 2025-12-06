"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";

interface RevenueData {
  mrr: number;
  arr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  planDistribution: Array<{ plan: string; count: number; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
}

const COLORS = ["#4F46E5", "#7C3AED", "#EC4899", "#F59E0B"];

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  async function fetchRevenueData() {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/revenue");
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      }
    } catch (error) {
      console.error("Failed to fetch revenue data", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-16">
        <div className="text-center">Loading revenue data...</div>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="container py-16">
        <div className="text-center">No revenue data available</div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Revenue Dashboard</h1>
        <p className="text-muted-foreground">
          Track revenue, subscriptions, and growth metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Recurring Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${revenueData.mrr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${revenueData.arr.toLocaleString()} ARR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{revenueData.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${revenueData.averageRevenuePerUser.toFixed(2)} ARPU
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Churn Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{revenueData.churnRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly churn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${revenueData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
          <CardDescription>Monthly recurring revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Subscriptions by plan tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData.planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ plan, count }) => `${plan}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {revenueData.planDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>Monthly revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.planDistribution.map((plan, index) => (
                <div key={plan.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium capitalize">{plan.plan}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${plan.revenue.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{plan.count} subscribers</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
