"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ActivationChartProps {
  data: Array<{
    date: string;
    activationRate: number;
    timeToActivation: number;
    day7Retention: number;
  }>;
}

export function ActivationChart({ data }: ActivationChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activation Metrics Over Time</CardTitle>
        <CardDescription>Track activation rate, time-to-activation, and retention</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="activationRate"
              stroke="#8884d8"
              name="Activation Rate (%)"
            />
            <Line
              type="monotone"
              dataKey="day7Retention"
              stroke="#82ca9d"
              name="Day 7 Retention (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
