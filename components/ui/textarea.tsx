"use client";

import * as React from "react"
import { motion } from "framer-motion";
import { motionTransitions, prefersReducedMotion } from "@/lib/style/motion";
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    
    const motionProps = prefersReducedMotion()
      ? {}
      : {
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          transition: motionTransitions.standard,
        };
    
    return (
      <motion.div
        className="relative w-full"
        {...motionProps}
      >
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-xl border border-border bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error && "border-destructive focus-visible:ring-destructive",
            success && "border-green-500 focus-visible:ring-green-500",
            focused && "shadow-md border-primary/50",
            className
          )}
          ref={ref}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${props.id || 'textarea'}-error` : undefined}
          {...props}
        />
      </motion.div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
