"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle2, Award, Globe, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustIndicatorProps {
  type: "security" | "compliance" | "verified" | "award" | "global" | "users";
  label: string;
  value?: string;
  icon?: React.ReactNode;
}

const iconMap = {
  security: Shield,
  compliance: Lock,
  verified: CheckCircle2,
  award: Award,
  global: Globe,
  users: Users,
};

export function TrustIndicator({ type, label, value, icon }: TrustIndicatorProps) {
  const Icon = iconMap[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon || <Icon className="h-5 w-5" />}
      </div>
      <div>
        {value && <div className="text-lg font-bold">{value}</div>}
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

interface TrustIndicatorsProps {
  indicators: TrustIndicatorProps[];
  className?: string;
}

export function TrustIndicators({ indicators, className }: TrustIndicatorsProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
      {indicators.map((indicator, i) => (
        <TrustIndicator key={i} {...indicator} />
      ))}
    </div>
  );
}
