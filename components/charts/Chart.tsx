/**
 * Chart Component Wrapper
 * Lazy-loads Recharts to reduce initial bundle size
 */

"use client";

import dynamic from "next/dynamic";
// import { ComponentType } from "react"; // Will be used for type definitions

// Lazy load Recharts components
export const LineChart = dynamic(
  () => import("recharts").then(mod => mod.LineChart),
  { ssr: false }
);

export const BarChart = dynamic(
  () => import("recharts").then(mod => mod.BarChart),
  { ssr: false }
);

export const PieChart = dynamic(
  () => import("recharts").then(mod => mod.PieChart),
  { ssr: false }
);

export const AreaChart = dynamic(
  () => import("recharts").then(mod => mod.AreaChart),
  { ssr: false }
);

export const ComposedChart = dynamic(
  () => import("recharts").then(mod => mod.ComposedChart),
  { ssr: false }
);

// Re-export other Recharts components as needed
export const XAxis = dynamic(
  () => import("recharts").then(mod => mod.XAxis as any),
  { ssr: false }
);

export const YAxis = dynamic(
  () => import("recharts").then(mod => mod.YAxis as any),
  { ssr: false }
);

export const CartesianGrid = dynamic(
  () => import("recharts").then(mod => mod.CartesianGrid as any),
  { ssr: false }
);

export const Tooltip = dynamic(
  () => import("recharts").then(mod => mod.Tooltip as any),
  { ssr: false }
);

export const Legend = dynamic(
  () => import("recharts").then(mod => mod.Legend as any),
  { ssr: false }
);

export const Line = dynamic(
  () => import("recharts").then(mod => mod.Line as any),
  { ssr: false }
);

export const Bar = dynamic(
  () => import("recharts").then(mod => mod.Bar as any),
  { ssr: false }
);

export const Pie = dynamic(
  () => import("recharts").then(mod => mod.Pie as any),
  { ssr: false }
);

export const Cell = dynamic(
  () => import("recharts").then(mod => mod.Cell as any),
  { ssr: false }
);

export const Area = dynamic(
  () => import("recharts").then(mod => mod.Area as any),
  { ssr: false }
);

export const ResponsiveContainer = dynamic(
  () => import("recharts").then(mod => mod.ResponsiveContainer as any),
  { ssr: false }
);
