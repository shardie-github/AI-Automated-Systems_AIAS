"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface UnitEconomics {
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  paybackPeriod: number; // months
  grossMargin: number;
  monthlyChurn: number;
  nrr: number; // Net Revenue Retention
  arr: number;
  customers: number;
}

interface ChannelMetrics {
  channel: string;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  customers: number;
  revenue: number;
}

export function LTVCACDashboard() {
  const [metrics, setMetrics] = useState<UnitEconomics | null>(null);
  const [channelMetrics, setChannelMetrics] = useState<ChannelMetrics[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real-time metrics
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    try {
      // In production, this would fetch from your analytics API
      const response = await fetch("/api/admin/metrics/unit-economics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setChannelMetrics(data.channels || []);
        setHistoricalData(data.historical || []);
      } else {
        // Fallback to mock data for demo
        setMockData();
      }
    } catch (error) {
      console.error("Failed to fetch metrics", error);
      setMockData();
    } finally {
      setLoading(false);
    }
  }

  function setMockData() {
    // Mock data for demonstration
    setMetrics({
      cac: 450,
      ltv: 4200,
      ltvCacRatio: 9.3,
      paybackPeriod: 4.5,
      grossMargin: 76,
      monthlyChurn: 4.2,
      nrr: 108,
      arr: 300000,
      customers: 250,
    });

    setChannelMetrics([
      { channel: "Product-Led", cac: 300, ltv: 4200, ltvCacRatio: 14, customers: 100, revenue: 420000 },
      { channel: "Content Marketing", cac: 400, ltv: 4500, ltvCacRatio: 11.25, customers: 80, revenue: 360000 },
      { channel: "Paid Ads", cac: 600, ltv: 4000, ltvCacRatio: 6.67, customers: 50, revenue: 200000 },
      { channel: "Partnerships", cac: 350, ltv: 5000, ltvCacRatio: 14.3, customers: 20, revenue: 100000 },
    ]);

    // Generate historical data
    const historical = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      historical.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        cac: 500 - (i * 5),
        ltv: 4000 + (i * 20),
        ltvCacRatio: (4000 + (i * 20)) / (500 - (i * 5)),
        customers: 50 + (i * 15),
        arr: 60000 + (i * 20000),
      });
    }
    setHistoricalData(historical);
  }

  if (loading) {
    return <div className="text-center py-8">Loading metrics...</div>;
  }

  if (!metrics) {
    return <div className="text-center py-8">No metrics available</div>;
  }

  const isHealthy = metrics.ltvCacRatio >= 3 && metrics.nrr >= 100 && metrics.monthlyChurn < 5;

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV:CAC Ratio</CardTitle>
            {metrics.ltvCacRatio >= 3 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ltvCacRatio.toFixed(1)}:1</div>
            <p className="text-xs text-muted-foreground">
              Target: &gt;3:1 {metrics.ltvCacRatio >= 3 ? "✅" : "⚠️"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAC</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.cac.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Payback: {metrics.paybackPeriod.toFixed(1)} months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.ltv.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Gross Margin: {metrics.grossMargin}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue Retention</CardTitle>
            {metrics.nrr >= 100 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.nrr.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Target: &gt;100% {metrics.nrr >= 100 ? "✅" : "⚠️"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Health Status */}
      {!isHealthy && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Unit Economics Review Needed
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-orange-800 dark:text-orange-200">
              {metrics.ltvCacRatio < 3 && (
                <li>⚠️ LTV:CAC ratio below 3:1 target</li>
              )}
              {metrics.nrr < 100 && (
                <li>⚠️ Net Revenue Retention below 100%</li>
              )}
              {metrics.monthlyChurn >= 5 && (
                <li>⚠️ Monthly churn rate above 5%</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">By Channel</TabsTrigger>
          <TabsTrigger value="historical">Historical Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
                <CardDescription>Current revenue and customer metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ARR</span>
                    <span className="text-lg font-semibold">${metrics.arr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customers</span>
                    <span className="text-lg font-semibold">{metrics.customers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. ACV</span>
                    <span className="text-lg font-semibold">
                      ${(metrics.arr / metrics.customers / 12).toFixed(0)}/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Churn</span>
                    <span className="text-lg font-semibold">{metrics.monthlyChurn.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unit Economics</CardTitle>
                <CardDescription>Detailed unit economics breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer Acquisition Cost</span>
                    <span className="text-lg font-semibold">${metrics.cac}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lifetime Value</span>
                    <span className="text-lg font-semibold">${metrics.ltv.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">LTV:CAC Ratio</span>
                    <span className={`text-lg font-semibold ${metrics.ltvCacRatio >= 3 ? "text-green-600" : "text-red-600"}`}>
                      {metrics.ltvCacRatio.toFixed(1)}:1
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payback Period</span>
                    <span className="text-lg font-semibold">{metrics.paybackPeriod.toFixed(1)} months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LTV:CAC by Channel</CardTitle>
              <CardDescription>Unit economics broken down by acquisition channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelMetrics.map((channel) => (
                  <div key={channel.channel} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{channel.channel}</h4>
                        <p className="text-sm text-muted-foreground">
                          {channel.customers} customers • ${channel.revenue.toLocaleString()} revenue
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${channel.ltvCacRatio >= 3 ? "text-green-600" : "text-red-600"}`}>
                          {channel.ltvCacRatio.toFixed(1)}:1
                        </div>
                        <p className="text-xs text-muted-foreground">LTV:CAC</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">CAC: </span>
                        <span className="font-medium">${channel.cac}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">LTV: </span>
                        <span className="font-medium">${channel.ltv.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Trends (12 Months)</CardTitle>
              <CardDescription>LTV:CAC ratio and key metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ltvCacRatio" stroke="#3b82f6" name="LTV:CAC Ratio" />
                  <Line type="monotone" dataKey="customers" stroke="#10b981" name="Customers" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CAC vs LTV Trend</CardTitle>
              <CardDescription>CAC and LTV evolution over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cac" fill="#ef4444" name="CAC ($)" />
                  <Bar dataKey="ltv" fill="#10b981" name="LTV ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
