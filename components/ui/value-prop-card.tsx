"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ValuePropCardProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  value?: string;
  badge?: string;
  gradient?: boolean;
  delay?: number;
  className?: string;
  onClick?: () => void;
}

export function ValuePropCard({
  icon: Icon,
  title,
  description,
  value,
  badge,
  gradient = false,
  delay = 0,
  className,
  onClick,
}: ValuePropCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={cn("h-full", className)}
    >
      <Card
        hover={true}
        gradient={gradient}
        className={cn(
          "h-full cursor-pointer transition-all duration-300",
          onClick && "hover:border-primary/50"
        )}
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            {badge && (
              <Badge variant="success" size="sm">
                {badge}
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          {value && (
            <div className="text-2xl font-bold text-primary mt-2">{value}</div>
          )}
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
