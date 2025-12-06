"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversionButtonProps extends ButtonProps {
  trackEvent?: string;
  urgency?: boolean;
  socialProof?: string;
  icon?: React.ReactNode;
}

export function ConversionButton({
  children,
  className,
  trackEvent,
  urgency = false,
  socialProof,
  icon,
  onClick,
  ...props
}: ConversionButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track conversion event
    if (trackEvent && typeof window !== "undefined") {
      // Analytics tracking would go here
      // Conversion event tracked (use logger in production)
      if (process.env.NODE_ENV === "development") {
        const { logger } = require("@/lib/utils/logger");
        logger.debug("Conversion event", trackEvent);
      }
    }
    onClick?.(e);
  };

  return (
    <motion.div
      className="relative inline-flex flex-col items-center gap-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="cta"
        size="lg"
        className={cn(
          "group relative overflow-hidden",
          urgency && "animate-pulse",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {icon || <Sparkles className="mr-2 h-4 w-4" />}
        {children}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        
        {/* Shimmer effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Button>
      
      {socialProof && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground text-center"
        >
          {socialProof}
        </motion.p>
      )}
    </motion.div>
  );
}
