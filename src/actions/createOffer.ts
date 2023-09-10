"use server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Listing, User } from "@prisma/client";
import type { OfferFormData } from "@/schemas/Offer";
import { pusherServer } from "@/lib/pusher";

export default async function createOffer(
  offer: OfferFormData,
  listing: Listing
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }
  const newOffer = await prisma.offer.create({
    data: {
      offerMessage: offer.offerMessage,
      offerPrice: offer.offerPrice,
      offerDate: new Date(),
      listingId: listing.id,
      offerUserId: currentUser.id,
    },
    include: {
      offerUser: true,
      listing: {
        include: {
          listingUser: true,
        },
      },
    },
  });
  // TODO: Have pusher broadcast to the listing owner's one way channel
  // And to the offer owner <> listing owner's two way channel
  const twoWayChannel = `offersFrom-${currentUser.id}-to-${newOffer.listing.listingUserId}`;
  const oneWayChannel = `offersTo-${newOffer.listing.listingUserId}`;

  await pusherServer.trigger(twoWayChannel, "newOffer", newOffer);
  await pusherServer.trigger(oneWayChannel, "newOffer", newOffer);

  return newOffer;
}

export type ExpandedOffer = Awaited<ReturnType<typeof createOffer>>;
