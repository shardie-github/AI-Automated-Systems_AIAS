"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialProofProps {
  stats: Array<{
    icon: React.ReactNode;
    value: string;
    label: string;
  }>;
  testimonials?: Array<{
    name: string;
    role: string;
    company: string;
    content: string;
    rating?: number;
  }>;
  badges?: string[];
  className?: string;
}

export function SocialProof({ stats, testimonials, badges, className }: SocialProofProps) {
  return (
    <section className={cn("py-12", className)}>
      {/* Stats */}
      {stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-primary mb-2 flex justify-center">{stat.icon}</div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Badges */}
      {badges && badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {badges.map((badge, i) => (
            <Badge key={i} variant="trust" size="lg">
              {badge}
            </Badge>
          ))}
        </motion.div>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              {testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={cn(
                        "h-4 w-4",
                        j < testimonial.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
              <div>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-xs text-muted-foreground">
                  {testimonial.role} at {testimonial.company}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
