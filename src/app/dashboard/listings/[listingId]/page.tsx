import Page from "@/components/Page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import FarmerPreview from "@/components/FarmerPreview";
import Pill from "@/components/Pill";
import StaticMap from "@/components/StaticMap";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import OfferButton from "@/components/buttons/OfferButton";
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
  const currentUserHasOffered = listing?.Offer.some(
    (offer) => offer.offerUserId === currentUser?.id
  );

  const totalOffers = listing?.Offer.length ?? 0;

  if (!listing) throw new Error("Listing not found");

  const { latitude, longitude } = listing.listingUser;
  return (
    <Page title={listing.title}>
      <div className="flex flex-col md:flex-row md:gap-x-10 max-w-3xl">
        <div className="h-[50vh] w-full bg-slate-200 rounded-lg shadow-sm flex">
          <h1 className="mx-auto my-auto text-slate-900 text-2xl">
            Image Placeholder
          </h1>
        </div>
        <div className="flex flex-col gap-y-2">
          <h2 className="text-3xl font-medium">${listing.startingPrice}</h2>
          <p className="text-slate-700">{listing.description}</p>
          <div className="mt-2 flex flex-row text-xs text-slate-500 gap-x-4">
            <p>Posted {new Date(listing.listedDate).toLocaleDateString()}</p>
            <p>
              Expires {new Date(listing.expirationDate).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-y-4">
            <div className="flex flex-row w-full">
              <h3 className="my-auto text-base font-medium">Seller Details</h3>
              {isOwner && (
                <Pill className="my-auto ml-auto" text="My Listing" />
              )}
            </div>
            <FarmerPreview {...listing.listingUser} />
            {latitude && longitude && (
              <StaticMap
                lat={latitude}
                lng={longitude}
                width={400}
                height={200}
              />
            )}
            {isOwner && <Button variant="destructive">Delete Listing</Button>}
            {!isOwner && !currentUserHasOffered && (
              <OfferButton currentUser={currentUser!} listing={listing} />
            )}
            {!isOwner && currentUserHasOffered && (
              <Link
                className="w-full"
                href={`/dashboard/inbox/${listing.listingUserId}`}
              >
                <Button className="w-full">View My Offer</Button>
              </Link>
            )}
          </div>
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
          <div className="flex flex-col gap-x-4 my-4">
            {listing.Offer.length > 0 &&
              listing.Offer.map((offer) => {
                return (
                  // TODO: Some day standardize the appearance of all these cards
                  // so they're not all different
                  // (Need the same border, padding, border radius, and shadow)
                  <div
                    className="w-full rounded-md border border-slate-200 p-4 shadow-sm flex flex-row"
                    key={offer.id}
                  >
                    <div className="flex flex-col gap-y-2">
                      <h2 className="text-3xl font-medium">
                        ${offer.offerPrice}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Posted{" "}
                        {new Date(listing.listedDate).toLocaleDateString()}
                      </p>
                      <p className="text-slate-700">{offer.offerMessage}</p>
                      <FarmerPreview {...offer.offerUser} />
                    </div>
                    <Link
                      className="ml-auto my-auto"
                      href={`/dashboard/inbox/${offer.offerUserId}`}
                    >
                      <Button>
                        Message{" "}
                        {offer.offerUser.name
                          ? offer.offerUser.name.split(" ")[0]
                          : "User"}
                      </Button>
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </Page>
  );
}
