/**
 * Loading Skeleton Components
 * Show while data is loading
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Dashboard Page Skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 bg-[hsl(var(--sf-brown-light))]" />
        <Skeleton className="h-4 w-96 bg-[hsl(var(--sf-brown-light))]" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-[hsl(var(--sf-brown-light))]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2 bg-[hsl(var(--sf-brown-light))]" />
              <Skeleton className="h-3 w-32 bg-[hsl(var(--sf-brown-light))]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-[hsl(var(--sf-brown-light))]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full bg-[hsl(var(--sf-brown-light))]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full bg-[hsl(var(--sf-brown-light))]" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, j) => (
            <Skeleton key={j} className="h-10 w-full bg-[hsl(var(--sf-brown-light))]" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Card Grid Skeleton
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="glass-card">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2 bg-[hsl(var(--sf-brown-light))]" />
            <Skeleton className="h-4 w-full bg-[hsl(var(--sf-brown-light))]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full bg-[hsl(var(--sf-brown-light))]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24 bg-[hsl(var(--sf-brown-light))]" />
          <Skeleton className="h-10 w-full bg-[hsl(var(--sf-brown-light))]" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 bg-[hsl(var(--sf-brown-light))]" />
    </div>
  );
}
