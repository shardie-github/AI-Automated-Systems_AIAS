"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Investor {
  id: string;
  name: string;
  firm?: string;
  title: string;
  email: string;
  phone?: string;
  linkedin?: string;
  type: "vc" | "angel" | "strategic";
  tier: "tier1" | "tier2" | "tier3";
  checkSize?: string;
  focus?: string[];
  portfolio?: string[];
  status: string;
  source: string;
  dateContacted?: string;
  dateMeeting?: string;
  dateFollowUp?: string;
  notes?: string;
  dealAmount?: number;
  dealStatus?: string;
}

interface InvestorSummary {
  total: number;
  contacted: number;
  meetingsScheduled: number;
  meetingsCompleted: number;
  interested: number;
  committed: number;
  totalCommitted: number;
  byType: {
    vc: number;
    angel: number;
  };
  byStatus: Record<string, number>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function InvestorDashboard() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [summary, setSummary] = useState<InvestorSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      const response = await fetch("/api/admin/investors");
      const data = await response.json();
      setInvestors(data.investors || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error("Error fetching investors:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      not_contacted: { label: "Not Contacted", className: "bg-gray-500" },
      warm_intro: { label: "Warm Intro", className: "bg-blue-500" },
      cold_outreach: { label: "Cold Outreach", className: "bg-yellow-500" },
      meeting_scheduled: { label: "Meeting Scheduled", className: "bg-purple-500" },
      meeting_completed: { label: "Meeting Completed", className: "bg-indigo-500" },
      interested: { label: "Interested", className: "bg-green-500" },
      passed: { label: "Passed", className: "bg-red-500" },
      committed: { label: "Committed", className: "bg-green-600" },
    };

    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-500" };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "vc":
        return <Badge variant="outline" className="border-blue-500 text-blue-700">VC</Badge>;
      case "angel":
        return <Badge variant="outline" className="border-purple-500 text-purple-700">Angel</Badge>;
      case "strategic":
        return <Badge variant="outline" className="border-green-500 text-green-700">Strategic</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-6">Loading investor data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">Target: 15</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.meetingsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                {summary.meetingsScheduled} scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Interested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.interested}</div>
              <p className="text-xs text-muted-foreground">
                {summary.committed} committed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Committed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(summary.totalCommitted / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Target: $3M</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Investor List</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investor Outreach</CardTitle>
              <CardDescription>Track investor meetings and deal status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investors.map((investor) => (
                  <div
                    key={investor.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{investor.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {investor.title}
                          {investor.firm && ` • ${investor.firm}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(investor.type)}
                        {getStatusBadge(investor.status)}
                      </div>
                    </div>

                    {investor.checkSize && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Check Size: </span>
                        <span className="font-medium">{investor.checkSize}</span>
                      </div>
                    )}

                    {investor.focus && investor.focus.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Focus:</p>
                        <div className="flex flex-wrap gap-2">
                          {investor.focus.map((f, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {investor.dateMeeting && (
                      <div className="text-sm text-muted-foreground">
                        Meeting: {new Date(investor.dateMeeting).toLocaleDateString()}
                      </div>
                    )}

                    {investor.dealAmount && (
                      <div className="text-sm font-medium text-green-600">
                        Committed: ${investor.dealAmount.toLocaleString()}
                      </div>
                    )}

                    {investor.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notes:</p>
                        <p className="text-sm">{investor.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          {summary && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Investors by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "VC", value: summary.byType.vc },
                          { name: "Angel", value: summary.byType.angel },
                          { name: "Strategic", value: summary.byType.strategic || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[summary.byType.vc, summary.byType.angel, summary.byType.strategic || 0].map((entry, index) => (
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
                  <CardTitle>Investors by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(summary.byStatus).map(([status, count]) => ({
                      status: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
                      count,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
