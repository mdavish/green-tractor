import Page from "@/components/Page";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
interface Params {
  params: {
    listingId: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { listingId: string };
}): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: {
      id: params.listingId,
    },
  });
  if (!listing) throw new Error("Listing not found");
  return {
    title: `Green Tractor Listing: ${listing.title}`,
  };
}

export default async function ListingDetail({ params: { listingId } }: Params) {
  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
  });
  if (!listing) throw new Error("Listing not found");
  return (
    <Page title={listing.title}>
      <div className="flex flex-col gap-y-2">
        <h2 className="text-3xl font-medium">${listing.startingPrice}</h2>
        <p className="text-slate-700 tracking-tight">{listing.description}</p>
        <div className="mt-2 flex flex-row text-xs text-slate-500 gap-x-4">
          <p>Posted {new Date(listing.listedDate).toLocaleDateString()}</p>
          <p>Expires {new Date(listing.expirationDate).toLocaleDateString()}</p>
        </div>
      </div>
    </Page>
  );
}
