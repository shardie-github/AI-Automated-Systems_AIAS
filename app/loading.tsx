import { Skeleton } from "@/components/ui/skeleton";

/**
 * Global loading component
 * Displays a skeleton loader while pages are loading
 */
export default function Loading() {
  return (
    <div className="container flex min-h-[60vh] flex-col gap-6 py-16">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4 max-w-md" />
        <Skeleton className="h-4 w-1/2 max-w-xs" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
