"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  type: "security" | "verified" | "award" | "rating" | "custom";
  label: string;
  icon?: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

const iconMap = {
  security: Shield,
  verified: CheckCircle2,
  award: Award,
  rating: Star,
  custom: null,
};

export function TrustBadge({ type, label, icon, pulse = false, className }: TrustBadgeProps) {
  const Icon = iconMap[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className={cn("inline-flex", className)}
    >
      <Badge
        variant="trust"
        pulse={pulse}
        className="gap-1.5 font-medium"
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </Badge>
    </motion.div>
  );
}
