"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  title: string;
  description: string;
  primaryAction: {
    label: string;
    href: string;
    variant?: "default" | "cta" | "trust" | "premium";
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  trustSignals?: string[];
  valueProps?: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
  className?: string;
  gradient?: boolean;
}

export function CTASection({
  title,
  description,
  primaryAction,
  secondaryAction,
  trustSignals = [],
  valueProps = [],
  className,
  gradient = true,
}: CTASectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-12",
        gradient && "bg-gradient-to-br from-card via-card/95 to-card/90",
        className
      )}
    >
      {/* Trust Badge */}
      {trustSignals.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {trustSignals.map((signal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Badge variant="trust" className="gap-1.5">
                <Shield className="h-3 w-3" />
                {signal}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
        >
          {title}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground mb-8 max-w-2xl"
        >
          {description}
        </motion.p>

        {/* Value Props */}
        {valueProps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {valueProps.map((prop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="text-primary mt-0.5">{prop.icon}</div>
                <p className="text-sm text-muted-foreground">{prop.text}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            asChild
            variant={primaryAction.variant || "cta"}
            size="lg"
            className="group"
          >
            <a href={primaryAction.href}>
              {primaryAction.label}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          {secondaryAction && (
            <Button asChild variant="outline" size="lg">
              <a href={secondaryAction.href}>{secondaryAction.label}</a>
            </Button>
          )}
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      </div>
    </motion.section>
  );
}
