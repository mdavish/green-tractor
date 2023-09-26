"use server";
import { getCurrentUserStrict } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Listing } from "@prisma/client";
import type { OfferFormData } from "@/schemas/Offer";
import { pusherServer } from "@/lib/pusher";

export default async function createOffer(
  offer: OfferFormData,
  listing: Listing
) {
  const currentUser = await getCurrentUserStrict();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }
  const newOffer = await prisma.createOffer({
    data: {
      offerMessage: offer.offerMessage,
      offerPrice: offer.offerPrice,
      offerDate: new Date(),
      listingId: listing.id,
      offerUserId: currentUser.id,
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
