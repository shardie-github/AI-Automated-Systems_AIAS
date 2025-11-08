import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button component variants configuration
 * Defines visual styles for different button types and sizes
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-fg hover:opacity-90",
        secondary: "bg-secondary text-secondary-fg hover:opacity-90",
        outline: "border border-border hover:bg-muted",
        ghost: "hover:bg-muted",
        destructive: "bg-destructive text-destructive-fg hover:opacity-90",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
        pill: "h-11 px-6 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

/**
 * Button component props
 * Extends standard button HTML attributes with variant and size props
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child component (e.g., Link) instead of button element */
  asChild?: boolean;
}

/**
 * Button component
 * 
 * A versatile button component with multiple variants and sizes.
 * Supports rendering as a button or as a child component (e.g., Next.js Link).
 * 
 * @example
 * ```tsx
 * // Default button
 * <Button>Click me</Button>
 * 
 * // Variant and size
 * <Button variant="destructive" size="lg">Delete</Button>
 * 
 * // As Link
 * <Button asChild variant="outline">
 *   <Link href="/about">About</Link>
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = "Button";
