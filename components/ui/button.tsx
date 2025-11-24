import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/90 text-primary-fg hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg",
        secondary: "bg-secondary text-secondary-fg hover:bg-secondary/80 shadow-sm hover:shadow-md",
        outline: "border-2 border-border bg-background hover:bg-muted hover:border-primary/50 shadow-sm hover:shadow-md",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive text-destructive-fg hover:bg-destructive/90 shadow-md hover:shadow-lg",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-8 text-base",
        pill: "h-11 px-8 rounded-full text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = "Button";
