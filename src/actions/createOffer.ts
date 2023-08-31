"use server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Listing, User } from "@prisma/client";
import type { OfferFormData } from "@/schemas/Offer";

export default async function createOffer(
  offer: OfferFormData,
  listing: Listing
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }
  return await prisma.offer.create({
    data: {
      offerMessage: offer.offerMessage,
      offerPrice: offer.offerPrice,
      offerDate: new Date(),
      listingId: listing.id,
      offerUserId: currentUser.id,
    },
  });
}
