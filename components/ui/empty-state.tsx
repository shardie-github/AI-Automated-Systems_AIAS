"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { motionVariants } from "@/lib/style/motion";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={motionVariants.fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div 
          className="mb-6 text-muted-foreground" 
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-8 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        {action && (
          <Button 
            onClick={action.onClick} 
            variant={action.variant || "default"}
            aria-label={action.label}
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button 
            onClick={secondaryAction.onClick} 
            variant="outline"
            aria-label={secondaryAction.label}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
