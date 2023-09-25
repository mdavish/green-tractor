import { useState } from "react";
import { Highlight, useHits, useSearchBox } from "react-instantsearch";
import type { Listing, CloudinaryAsset } from "@prisma/client";
import { Input } from "./ui/input";
import ResponsiveImage from "./ResponsiveImage";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FaMagnifyingGlass } from "react-icons/fa6";

export type AlgoliaListingResponse = Listing & {
  mainImage: CloudinaryAsset | null | undefined;
};

export default function SearchBar({
  className,
  inputClassName,
  placeholder = "Search the marketplace...",
}: {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  const { query, refine } = useSearchBox();
  const { hits } = useHits<AlgoliaListingResponse>();
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const router = useRouter();
  const [showResults, setShowResults] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
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
      e.preventDefault();
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
      if (selectedIndex === undefined) return;
      if (hits[selectedIndex] === undefined) return;
      router.push(`/listings/${hits[selectedIndex]?.objectID}`);
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setShowResults(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* TODO: Add search and clear icon buttons */}
      <Input
        onBlur={() => setShowResults(false)}
        onFocus={() => setShowResults(true)}
        onKeyDown={handleKeyDown}
        onChange={(e) => refine(e.target.value)}
        className={cn(
          "w-full border border-slate-200 rounded-full py-3 px-5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          inputClassName
        )}
        placeholder={placeholder}
      />
      <button
        onClick={
          () => router.push(`/search?q=${query}`) // TODO: Add search page
        }
        className="absolute right-3 top-3"
      >
        <FaMagnifyingGlass className="text-primary" />
      </button>
      {query && hits.length > 0 && showResults && (
        <ul className="text-left mt-2 absolute z-50 top-[100%] bg-white flex flex-col divide-y  divide-slate-300 w-full rounded-md overflow-hidden shadow-lg border border-slate-200 ">
          {hits.map((hit, index) => {
            return (
              // We use an anchor tag because Next shouldn't try to prefetch everything
              // It's too dynamic and crazy
              <a
                key={hit.objectID}
                href={`/listings/${hit.objectID}`}
                className={cn(
                  index === selectedIndex
                    ? "bg-slate-100"
                    : "bg-white hover:bg-slate-50"
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
