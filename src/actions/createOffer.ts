"use server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Listing, User } from "@prisma/client";
import type { Offer } from "@/schemas/Offer";

export default async function createOffer(
  offer: Offer,
  listing: Listing,
  listingUser: User
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }
  return await prisma.offer.create({
    data: {
      offerDate: new Date(),
      offerMessage: offer.message,
      offerPrice: offer.price,
      listingId: listing.id,
      offerUserId: currentUser.id,
    },
  });
}
