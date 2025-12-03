"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { motionVariants } from "@/lib/style/motion";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  "aria-label"?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingState({
  message = "Loading...",
  className,
  size = "md",
  "aria-label": ariaLabel,
}: LoadingStateProps) {
  return (
    <motion.div
      variants={motionVariants.fadeIn}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || message}
    >
      <Loader2 
        className={cn("animate-spin text-muted-foreground", sizeMap[size])} 
        aria-hidden="true"
      />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </motion.div>
  );
}
