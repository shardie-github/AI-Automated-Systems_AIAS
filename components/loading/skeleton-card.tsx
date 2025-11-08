import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton card component for loading states
 * 
 * @example
 * ```tsx
 * <SkeletonCard />
 * <SkeletonCard variant="compact" />
 * ```
 */
export function SkeletonCard({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4",
        variant === "compact" && "p-3",
        className
      )}
    >
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        {variant === "default" && (
          <>
            <Skeleton className="h-4 w-4/6" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
