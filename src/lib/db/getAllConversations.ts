/**
 * A conversation is the collection of both offers and messages unioned together.
 */

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function getAllConversations() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  // OLD But keeping it here for reference
  // return await prisma.$queryRaw`
  // SELECT
  //   "Offer"."id" AS "offerId",
  //   "Offer"."offerDate" AS "offerDate",
  //   "Offer"."offerUserId" AS "offerUserId",
  //   "Offer"."listingId" AS "offerListingId",
  //   "Offer"."offerPrice" AS "offerPrice",
  //   "Offer"."offerMessage" AS "offerMessage",
  //   "Listing"."id" AS "listingId",
  //   "Listing"."title" AS "title",
  //   "Listing"."description" AS "description",
  //   "Listing"."listingUserId" AS "listingUserId"
  // FROM public."Offer"
  //   INNER JOIN public."Listing" ON "Offer"."listingId" = "Listing"."id"
  // WHERE
  //   "Offer"."offerUserId" = ${currentUser.id}
  // `;

  const offersToOrFrom = await prisma.offer.findMany({
    where: {
      OR: [
        {
          offerUserId: currentUser.id,
        },
        {
          listing: {
            listingUserId: currentUser.id,
          },
        },
      ],
    },
    include: {
      listing: true,
    },
  });

  // Find the latest message for each other user
  const conversations = offersToOrFrom.map((offer) => {
    const otherUserId =
      offer.offerUserId === currentUser.id
        ? offer.listing.listingUserId
        : offer.offerUserId;

    return {
      offerId: offer.id,
      offerDate: offer.offerDate,
      offerUserId: offer.offerUserId,
      offerListingId: offer.listingId,
      offerPrice: offer.offerPrice,
      offerMessage: offer.offerMessage,
      listingId: offer.listing.id,
      title: offer.listing.title,
      description: offer.listing.description,
      listingUserId: offer.listing.listingUserId,
      otherUserId,
    };
  });
  return conversations;
}
