"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { motionTransitions, prefersReducedMotion } from "@/lib/style/motion";

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "text" | "circular" | "rectangular";
}) {
  const baseClasses = "animate-pulse bg-muted";
  const variantClasses = {
    default: "rounded-md",
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={prefersReducedMotion() ? { duration: 0.01 } : motionTransitions.standard}
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-hidden="true"
      {...(props as any)}
    />
  );
}

export { Skeleton };
