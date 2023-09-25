import { Skeleton } from "@/components/ui/skeleton";

export default function ListingLoadingSkeleton() {
  // TODO: Make this look like a listing preview
  return (
    <div className="flex flex-col p-6 md:p-10 w-full">
      <Skeleton className="w-1/3 h-8" />
    </div>
  );
}
