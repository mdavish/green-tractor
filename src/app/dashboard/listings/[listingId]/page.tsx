import Page from "@/components/Page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import FarmerPreview from "@/components/FarmerPreview";
import Pill from "@/components/Pill";
import StaticMap from "@/components/StaticMap";
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
    include: {
      listingUser: true,
      Offer: {
        include: {
          offerUser: true,
        },
      },
    },
    where: {
      id: listingId,
    },
  });

  const currentUser = await getCurrentUser();
  const isOwner = listing?.listingUserId === currentUser?.id;

  const totalOffers = listing?.Offer.length ?? 0;

  if (!listing) throw new Error("Listing not found");

  const { latitude, longitude } = listing.listingUser;
  return (
    <Page title={listing.title}>
      <div className="flex flex-col md:flex-row md:gap-x-10 max-w-3xl">
        <div className="flex flex-col gap-y-2">
          <h2 className="text-3xl font-medium">${listing.startingPrice}</h2>
          <p className="text-slate-700 tracking-tight">{listing.description}</p>
          <div className="mt-2 flex flex-row text-xs text-slate-500 gap-x-4">
            <p>Posted {new Date(listing.listedDate).toLocaleDateString()}</p>
            <p>
              Expires {new Date(listing.expirationDate).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-y-2">
            <h3 className="text-base font-medium">Seller Details</h3>
            {isOwner && <Pill text="My Listing" />}
            <FarmerPreview {...listing.listingUser} />
            {latitude && longitude && (
              <StaticMap
                lat={latitude}
                lng={longitude}
                width={400}
                height={200}
              />
            )}
          </div>
        </div>
        <div className="h-[50vh] w-full bg-slate-200 rounded-lg shadow-sm flex">
          <h1 className="mx-auto my-auto text-slate-900 text-2xl">
            Image Placeholder
          </h1>
        </div>
      </div>
      {isOwner && (
        <div className="mt-4">
          <SectionHeader
            header="Offers"
            subheader={
              totalOffers > 0
                ? `Your listing has received ${totalOffers} offer${
                    totalOffers > 1 ? "s" : ""
                  }.`
                : `No offers yet.`
            }
          />
        </div>
      )}
    </Page>
  );
}
