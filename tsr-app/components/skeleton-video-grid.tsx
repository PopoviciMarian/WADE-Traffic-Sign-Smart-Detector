import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonVideoGridProps {
  count?: number
}

export function SkeletonVideoGrid({ count = 6 }: SkeletonVideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-surface-a10 dark:bg-surface-a10">
          <CardContent className="p-4 h-[28rem]">
            <Skeleton className="w-full aspect-[16/9] rounded-lg" />
            <div className="flex items-center justify-between mt-4">
              <Skeleton className="h-6 w-3/4" />
            </div>
            <div className="flex items-center mt-2">
              <Skeleton className="h-6 w-6 rounded-full mr-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
