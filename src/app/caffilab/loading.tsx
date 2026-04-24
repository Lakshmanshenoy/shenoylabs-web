import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0c0d0b] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="mb-2 h-12 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>

        <div className="mb-8">
          <Skeleton className="aspect-[16/10] w-full max-w-2xl rounded-[8px]" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-[8px]" />
            <Skeleton className="h-32 w-full rounded-[8px]" />
            <Skeleton className="h-24 w-full rounded-[8px]" />
          </div>

          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-[8px]" />
            <Skeleton className="h-48 w-full rounded-[8px]" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-24 rounded-[8px]" />
              <Skeleton className="h-24 rounded-[8px]" />
              <Skeleton className="h-24 rounded-[8px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}