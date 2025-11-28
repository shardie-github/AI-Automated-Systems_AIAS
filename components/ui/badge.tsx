"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:scale-105 active:scale-95",
        secondary: "border-transparent bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:scale-105 active:scale-95",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:shadow-md hover:scale-105 active:scale-95",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
        success: "border-transparent bg-green-500 text-white shadow-sm hover:shadow-md hover:bg-green-600 hover:scale-105 active:scale-95",
        warning: "border-transparent bg-yellow-500 text-white shadow-sm hover:shadow-md hover:bg-yellow-600 hover:scale-105 active:scale-95",
        info: "border-transparent bg-blue-500 text-white shadow-sm hover:shadow-md hover:bg-blue-600 hover:scale-105 active:scale-95",
        trust: "border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg hover:scale-105 active:scale-95",
        premium: "border-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-bold",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

function Badge({ className, variant, size, pulse = false, ...props }: BadgeProps) {
  const MotionDiv = motion.div;
  
  return (
    <MotionDiv
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(badgeVariants({ variant, size }), className)}
      {...(props as any)}
    >
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-current opacity-75 animate-ping" />
      )}
      <span className="relative">{props.children}</span>
    </MotionDiv>
  );
}

export { Badge, badgeVariants };
