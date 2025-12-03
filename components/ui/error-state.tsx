"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { motionVariants } from "@/lib/style/motion";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  "aria-label"?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  className,
  "aria-label": ariaLabel,
}: ErrorStateProps) {
  return (
    <motion.div
      variants={motionVariants.fadeIn}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <Card 
        className={cn("border-destructive")}
        role="alert"
        aria-live="assertive"
        aria-label={ariaLabel || title}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle 
              className="h-5 w-5 text-destructive flex-shrink-0" 
              aria-hidden="true"
            />
            <CardTitle className="text-destructive">{title}</CardTitle>
          </div>
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>
        {onRetry && (
          <CardContent>
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="default"
              aria-label="Retry loading content"
            >
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
