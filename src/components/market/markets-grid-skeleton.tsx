/**
 * Markets Grid Skeleton
 *
 * Loading skeleton for the markets grid.
 * Displays placeholder cards while data is loading.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MarketsGridSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" | "compact" }) {
  const skeletonCount = 20 // Show 20 skeleton cards

  if (viewMode === "compact") {
    return (
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="flex-1" />
                <div className="h-6 w-12 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-5 w-3/4 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <div className="h-3 w-12 bg-muted rounded" />
                    <div className="h-6 w-16 bg-muted rounded" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-12 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                  <div className="h-8 w-8 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Grid view (default)
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <Card key={i} className="animate-pulse h-full">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="h-5 w-16 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded -mr-2 -mt-2" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="h-5 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-7 w-16 bg-muted rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-12 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="h-9 w-full bg-muted rounded mt-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
