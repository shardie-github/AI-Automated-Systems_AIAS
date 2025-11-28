"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SEOHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  gradient?: boolean;
  animate?: boolean;
  priority?: "high" | "medium" | "low";
}

export const SEOHeading = React.forwardRef<HTMLHeadingElement, SEOHeadingProps>(
  ({ as: Component = "h2", gradient = false, animate = true, priority = "medium", className, children, ...props }, ref) => {
    const headingClasses = cn(
      "font-bold tracking-tight",
      {
        "text-4xl md:text-5xl lg:text-6xl": Component === "h1",
        "text-3xl md:text-4xl": Component === "h2",
        "text-2xl md:text-3xl": Component === "h3",
        "text-xl md:text-2xl": Component === "h4",
        "text-lg md:text-xl": Component === "h5",
        "text-base md:text-lg": Component === "h6",
      },
      gradient && "bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent",
      className
    );

    const content = (
      <Component
        ref={ref}
        className={headingClasses}
        {...props}
      >
        {children}
      </Component>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }
);
SEOHeading.displayName = "SEOHeading";
