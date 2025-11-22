"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface FunnelChartProps {
  data: {
    signups: number;
    integrations: number;
    workflows: number;
    activations: number;
  };
}

export function FunnelChart({ data }: FunnelChartProps) {
  const chartData = [
    { stage: "Signups", count: data.signups, percentage: 100 },
    { stage: "Integrations", count: data.integrations, percentage: data.signups > 0 ? (data.integrations / data.signups) * 100 : 0 },
    { stage: "Workflows", count: data.workflows, percentage: data.integrations > 0 ? (data.workflows / data.integrations) * 100 : 0 },
    { stage: "Activations", count: data.activations, percentage: data.workflows > 0 ? (data.activations / data.workflows) * 100 : 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activation Funnel</CardTitle>
        <CardDescription>User journey from signup to activation</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Users" />
            <Bar dataKey="percentage" fill="#82ca9d" name="Conversion %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
