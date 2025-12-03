"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { motionTransitions, motionTranslate, prefersReducedMotion } from "@/lib/style/motion";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { 
  hover?: boolean;
  gradient?: boolean;
}>(
  ({ className, hover = true, gradient = false, ...props }, ref) => {
    const MotionDiv = motion.div;
    const motionProps = prefersReducedMotion()
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: motionTransitions.entrance,
          whileHover: hover 
            ? { y: motionTranslate.lift, transition: motionTransitions.standard } 
            : undefined,
        };
    
    return (
      <MotionDiv
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-200",
          hover && "hover:shadow-lg hover:border-primary/20",
          gradient && "bg-gradient-to-br from-card to-card/50",
          className
        )}
        {...motionProps}
        {...(props as any)}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)} 
      {...props} 
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p 
      ref={ref} 
      className={cn("text-sm text-muted-foreground leading-relaxed", className)} 
      {...props} 
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-4", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("flex items-center p-6 pt-0 border-t border-border/50", className)} 
      {...props} 
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
