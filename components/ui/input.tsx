import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input component props
 * Extends standard input HTML attributes
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input component
 * 
 * A styled input component for forms with consistent styling.
 * Supports all standard HTML input attributes and types.
 * 
 * @example
 * ```tsx
 * // Basic input
 * <Input type="text" placeholder="Enter your name" />
 * 
 * // With label
 * <label>
 *   Email
 *   <Input type="email" name="email" required />
 * </label>
 * 
 * // Disabled state
 * <Input type="text" disabled value="Read-only" />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
