"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { LOIForm } from "./loi-form";
import { TrendingUp, FileText, CheckCircle2, Clock, Sparkles, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

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

const COLORS = {
  Starter: "#94a3b8",
  Pro: "#3b82f6",
  Enterprise: "#8b5cf6",
};

export function LOIDashboardEnhanced() {
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
    const variants: Record<string, { label: string; className: string; icon: any }> = {
      signed: {
        label: "Signed",
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg",
        icon: CheckCircle2,
      },
      sent: {
        label: "Sent",
        className: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg",
        icon: Clock,
      },
      draft: {
        label: "Draft",
        className: "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg",
        icon: FileText,
      },
      expired: {
        label: "Expired",
        className: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg",
        icon: Clock,
      },
    };

    const variant = variants[status] || variants.draft;
    const Icon = variant.icon;

    return (
      <Badge className={variant.className}>
        <Icon className="mr-1 h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      Enterprise: {
        label: "Enterprise",
        className: "border-purple-500 text-purple-700 bg-purple-50",
      },
      Pro: {
        label: "Pro",
        className: "border-blue-500 text-blue-700 bg-blue-50",
      },
      Starter: {
        label: "Starter",
        className: "border-gray-500 text-gray-700 bg-gray-50",
      },
    };

    const variant = variants[tier] || variants.Starter;

    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-8 w-8" />
                Letters of Intent
              </h2>
              <p className="text-blue-100 text-lg">
                Track LOIs for Seed Round fundraising
              </p>
            </div>
            <LOIForm onSuccess={fetchLOIs} />
          </div>
        </div>
      </motion.div>

      {/* Enhanced Summary Cards with Animations */}
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
                <FileText className="h-4 w-4 text-blue-600" />
                Total LOIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{summary.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Target: 5</p>
              <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summary.total / 5) * 100}%` }}
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
                Signed LOIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{summary.signed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.total > 0 ? ((summary.signed / summary.total) * 100).toFixed(0) : 0}% signed
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Total ARR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                ${(summary.totalARR / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">From signed LOIs</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-amber-600" />
                Average ACV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                ${summary.avgACV.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per signed LOI</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-white shadow-md">
          <TabsTrigger value="list">LOI List</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Letters of Intent</CardTitle>
              <CardDescription>Track LOIs for Seed Round fundraising</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lois.map((loi, index) => (
                  <motion.div
                    key={loi.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-2 rounded-xl p-6 space-y-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-xl">{loi.company}</h3>
                        <p className="text-sm text-muted-foreground">
                          {loi.contact} • {loi.industry} • {loi.companySize} employees
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTierBadge(loi.tier)}
                        {getStatusBadge(loi.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Monthly</p>
                        <p className="font-bold text-blue-600">${loi.monthlyCommitment.toLocaleString()}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Annual Value</p>
                        <p className="font-bold text-purple-600">${loi.annualValue.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                        <p className="font-bold text-green-600">{loi.timeline} months</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Created</p>
                        <p className="font-bold text-amber-600">
                          {new Date(loi.dateCreated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {loi.requirements.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Requirements:</p>
                        <div className="flex flex-wrap gap-2">
                          {loi.requirements.map((req, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {loi.dateSigned && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          Signed: {new Date(loi.dateSigned).toLocaleDateString()}
                          {loi.validUntil && ` • Valid until: ${new Date(loi.validUntil).toLocaleDateString()}`}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          {summary && (
            <>
              <Card className="shadow-lg">
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
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {["Starter", "Pro", "Enterprise"].map((tier, index) => (
                          <Cell key={tier} fill={COLORS[tier as keyof typeof COLORS]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
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
                      <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
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
