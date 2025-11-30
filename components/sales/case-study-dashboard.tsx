"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CaseStudy {
  id: string;
  title: string;
  customer: string;
  industry: string;
  companySize: string;
  useCase: string;
  tier: "Starter" | "Pro" | "Enterprise";
  date: string;
  status: "draft" | "in_review" | "approved" | "published";
  results: {
    quantitative: {
      timeSaved: {
        saved: string;
        value: string;
      };
      costSavings: {
        netSavings: string;
      };
      roi: {
        roi: string;
        paybackPeriod: string;
      };
    };
    testimonial: {
      quote: string;
      author: string;
      title: string;
      company: string;
    };
  };
  metadata: {
    useCases: string[];
    industries: string[];
    tags: string[];
  };
}

interface CaseStudySummary {
  total: number;
  published: number;
  byTier: {
    Starter: number;
    Pro: number;
    Enterprise: number;
  };
  byIndustry: Record<string, number>;
}

export function CaseStudyDashboard() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [summary, setSummary] = useState<CaseStudySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      const response = await fetch("/api/admin/case-studies");
      const data = await response.json();
      setCaseStudies(data.caseStudies || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error("Error fetching case studies:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "approved":
        return <Badge className="bg-blue-500">Approved</Badge>;
      case "in_review":
        return <Badge className="bg-yellow-500">In Review</Badge>;
      case "draft":
        return <Badge className="bg-gray-500">Draft</Badge>;
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
    return <div className="p-6">Loading case studies...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Case Studies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">Target: 3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.published}</div>
              <p className="text-xs text-muted-foreground">
                {summary.total > 0 ? ((summary.published / summary.total) * 100).toFixed(0) : 0}% published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">By Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Enterprise:</span>
                  <span className="font-medium">{summary.byTier.Enterprise}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pro:</span>
                  <span className="font-medium">{summary.byTier.Pro}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Starter:</span>
                  <span className="font-medium">{summary.byTier.Starter}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Industries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(summary.byIndustry).length}</div>
              <p className="text-xs text-muted-foreground">Different industries</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Case Studies</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Success Stories</CardTitle>
              <CardDescription>Case studies for sales and marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseStudies.map((cs) => (
                  <div
                    key={cs.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{cs.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cs.customer} • {cs.industry} • {cs.companySize}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTierBadge(cs.tier)}
                        {getStatusBadge(cs.status)}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Use Case:</p>
                      <p className="text-sm font-medium">{cs.useCase}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Time Saved</p>
                        <p className="font-medium">{cs.results.quantitative.timeSaved.saved}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Value</p>
                        <p className="font-medium">{cs.results.quantitative.timeSaved.value}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROI</p>
                        <p className="font-medium text-green-600">{cs.results.quantitative.roi.roi}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payback</p>
                        <p className="font-medium">{cs.results.quantitative.roi.paybackPeriod}</p>
                      </div>
                    </div>

                    {cs.results.testimonial && (
                      <div className="border-l-4 border-blue-500 pl-4 italic">
                        <p className="text-sm">"{cs.results.testimonial.quote}"</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          — {cs.results.testimonial.author}, {cs.results.testimonial.title}, {cs.results.testimonial.company}
                        </p>
                      </div>
                    )}

                    {cs.metadata.tags && cs.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {cs.metadata.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Published: {new Date(cs.date).toLocaleDateString()}
                    </div>
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
                  <CardTitle>Case Studies by Tier</CardTitle>
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
                  <CardTitle>Case Studies by Industry</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(summary.byIndustry).map(([industry, count]) => ({
                      industry,
                      count,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="industry" />
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
