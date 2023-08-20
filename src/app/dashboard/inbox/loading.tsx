import { Skeleton } from "@/components/ui/skeleton";

export default function InboxLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-y-4 w-1/4 border-r h-full pt-10 px-5 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 w-full">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
