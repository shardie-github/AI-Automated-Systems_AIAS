"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LOIForm } from "./loi-form";

interface LOI {
  id: string;
  company: string;
  contact: string;
  email: string;
  industry: string;
  companySize: string;
  tier: "Starter" | "Pro" | "Enterprise";
  monthlyCommitment: number;
  annualValue: number;
  timeline: number;
  status: "draft" | "sent" | "signed" | "expired";
  requirements: string[];
  dateCreated: string;
  dateSent?: string;
  dateSigned?: string;
  validUntil?: string;
  notes?: string;
}

interface LOISummary {
  total: number;
  signed: number;
  totalARR: number;
  avgACV: number;
  byTier: {
    Starter: number;
    Pro: number;
    Enterprise: number;
  };
  byStatus: {
    draft: number;
    sent: number;
    signed: number;
    expired: number;
  };
}

export function LOIDashboard() {
  const [lois, setLOIs] = useState<LOI[]>([]);
  const [summary, setSummary] = useState<LOISummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLOIs();
  }, []);

  const fetchLOIs = async () => {
    try {
      const response = await fetch("/api/admin/lois");
      const data = await response.json();
      setLOIs(data.lois || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error("Error fetching LOIs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge className="bg-green-500">Signed</Badge>;
      case "sent":
        return <Badge className="bg-yellow-500">Sent</Badge>;
      case "draft":
        return <Badge className="bg-gray-500">Draft</Badge>;
      case "expired":
        return <Badge className="bg-red-500">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Enterprise":
        return <Badge variant="outline" className="border-purple-500 text-purple-700">Enterprise</Badge>;
      case "Pro":
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Pro</Badge>;
      case "Starter":
        return <Badge variant="outline" className="border-gray-500 text-gray-700">Starter</Badge>;
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-6">Loading LOI data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <LOIForm onSuccess={fetchLOIs} />
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total LOIs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">Target: 5</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Signed LOIs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.signed}</div>
              <p className="text-xs text-muted-foreground">
                {summary.total > 0 ? ((summary.signed / summary.total) * 100).toFixed(0) : 0}% signed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total ARR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalARR.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From signed LOIs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average ACV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.avgACV.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Per signed LOI</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">LOI List</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Letters of Intent</CardTitle>
              <CardDescription>Track LOIs for Seed Round fundraising</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lois.map((loi) => (
                  <div
                    key={loi.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{loi.company}</h3>
                        <p className="text-sm text-muted-foreground">
                          {loi.contact} • {loi.industry} • {loi.companySize} employees
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTierBadge(loi.tier)}
                        {getStatusBadge(loi.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Monthly</p>
                        <p className="font-medium">${loi.monthlyCommitment.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Annual Value</p>
                        <p className="font-medium">${loi.annualValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Timeline</p>
                        <p className="font-medium">{loi.timeline} months</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{new Date(loi.dateCreated).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {loi.requirements.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Requirements:</p>
                        <div className="flex flex-wrap gap-2">
                          {loi.requirements.map((req, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {loi.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notes:</p>
                        <p className="text-sm">{loi.notes}</p>
                      </div>
                    )}

                    {loi.dateSigned && (
                      <div className="text-xs text-muted-foreground">
                        Signed: {new Date(loi.dateSigned).toLocaleDateString()}
                        {loi.validUntil && ` • Valid until: ${new Date(loi.validUntil).toLocaleDateString()}`}
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
                  <CardTitle>LOIs by Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { tier: "Starter", count: summary.byTier.Starter },
                      { tier: "Pro", count: summary.byTier.Pro },
                      { tier: "Enterprise", count: summary.byTier.Enterprise },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tier" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>LOIs by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { status: "Draft", count: summary.byStatus.draft },
                      { status: "Sent", count: summary.byStatus.sent },
                      { status: "Signed", count: summary.byStatus.signed },
                      { status: "Expired", count: summary.byStatus.expired },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
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
