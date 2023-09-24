import { useState } from "react";
import { Highlight, useHits, useSearchBox } from "react-instantsearch";
import type { Listing, CloudinaryAsset } from "@prisma/client";
import { Input } from "./ui/input";
import ResponsiveImage from "./ResponsiveImage";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export type AlgoliaListingResponse = Listing & {
  mainImage: CloudinaryAsset | null | undefined;
};

export default function SearchBar({ className }: { className?: string }) {
  const { query, refine } = useSearchBox();
  const { hits } = useHits<AlgoliaListingResponse>();
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      if (selectedIndex === undefined) {
        setSelectedIndex(0);
      } else if (selectedIndex === hits.length - 1) {
        // Cycle back to the top
        setSelectedIndex(0);
      } else {
        setSelectedIndex(selectedIndex + 1);
      }
    }

    if (e.key === "ArrowUp") {
      if (selectedIndex === undefined) {
        setSelectedIndex(0);
      } else if (selectedIndex === 0) {
        // Cycle back to the bottom
        setSelectedIndex(hits.length - 1);
      } else {
        setSelectedIndex(selectedIndex - 1);
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (!selectedIndex) return;
      if (!hits[selectedIndex]) return;
      router.push(`/dashboard/listings/${hits[selectedIndex]?.objectID}`);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* TODO: Add search and clear icon buttons */}
      <Input
        onKeyDown={handleKeyDown}
        onChange={(e) => refine(e.target.value)}
        className="w-full border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="Search the marketplace..."
      />
      {query && hits.length > 0 && (
        <ul className="text-left mt-2 absolute z-30 top-[100%] bg-white flex flex-col divide-y  divide-slate-300 w-full rounded-md overflow-hidden shadow-lg border border-slate-200 ">
          {hits.map((hit, index) => {
            return (
              // We use an anchor tag because Next shouldn't try to prefetch everything
              // It's too dynamic and crazy
              <a
                key={hit.objectID}
                href={`/dashboard/listings/${hit.objectID}`}
                className={cn(
                  "hover:bg-slate-50",
                  index === selectedIndex && "bg-slate-50"
                )}
              >
                <li className="text-slate-900 p-3 z-50 flex flex-row gap-x-4 justify-normal">
                  <ResponsiveImage
                    className="shrink-0"
                    cloudinaryPublicId={hit.mainImage?.public_id}
                    size="xs"
                    alt={`Image of ${hit.title}`}
                    fallbackText=""
                  />
                  <div className="grow flex flex-col gap-y-1 my-auto w-fit">
                    <Highlight
                      className="line-clamp-1 overflow-ellipsis text-sm"
                      attribute="title"
                      hit={hit}
                    />
                    <Highlight
                      className="line-clamp-1 overflow-ellipsis text-slate-700 text-xs"
                      attribute="description"
                      hit={hit}
                    />
                  </div>
                </li>
              </a>
            );
          })}
        </ul>
      )}
    </div>
  );
}
