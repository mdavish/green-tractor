"use client";
import { algoliaClient } from "@/lib/algolia";
import { InstantSearch, useHits } from "react-instantsearch";
import Page from "@/components/Page";
import type { AlgoliaListingResponse } from "@/components/SearchBar";
import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";

function Inner() {
  const { hits } = useHits<AlgoliaListingResponse>();
  return (
    <Page title="Search" maxWidth={false}>
      <div className="flex flex-row gap-x-4">
        {/* TODO: Put facets ("refinement list") here */}
        <ul className="grid md:grid-cols-4 pb-6 gap-x-6 gap-y-6">
          {hits.map((hit, index) => {
            return (
              <Link
                href={`/listings/${hit.id}`}
                key={hit.objectID}
                className="hover:-translate-y-2 transition-all ease-in-out duration-150 h-full"
              >
                <li className="h-full border border-slate-200 shadow-sm rounded-lg overflow-hidden flex flex-col gap-y-2">
                  <ResponsiveImage
                    className="shrink-0 rounded-none"
                    cloudinaryPublicId={hit.mainImage?.public_id}
                    size="small"
                    alt={`Image of ${hit.title}`}
                    fallbackText="No Image Available"
                  />
                  <div className="h-full px-3 py-1 flex flex-col gap-y-2 mt-1 mb-3">
                    <h1 className="text-slate-800">{hit.title}</h1>
                    <p className="text-xs line-clamp-3 text-slate-500">
                      {hit.description}
                    </p>
                    <h2 className="mt-auto text-base text-slate-800">
                      ${hit.startingPrice.toLocaleString()}
                    </h2>
                  </div>
                </li>
              </Link>
            );
          })}
        </ul>
      </div>
    </Page>
  );
}

export default function SearchPage() {
  return (
    <InstantSearch
      searchClient={algoliaClient}
      indexName="listings_index"
      routing={true}
    >
      <Inner />
    </InstantSearch>
  );
}
