/**
 * A conversation is the collection of both offers and messages unioned together.
 */

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface Conversation {
  otherUserId: string;
  otherUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  latestOffer: {
    offerId: string;
    offerMessage: string;
    offerDate: Date;
  };
}

export default async function getAllConversations(): Promise<Conversation[]> {
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
      listing: {
        include: {
          listingUser: true,
        },
      },
      offerUser: true,
    },
  });

  // Find the latest message for each other user
  const conversations: Conversation[] = [];
  offersToOrFrom.forEach((offer) => {
    const otherUserId =
      offer.offerUserId === currentUser.id
        ? offer.listing.listingUserId
        : offer.offerUserId;
    const conversation = conversations.find(
      (c) => c.otherUserId === otherUserId
    );
    if (!conversation) {
      conversations.push({
        otherUserId,
        otherUser: {
          id:
            offer.offerUserId === currentUser.id
              ? offer.listing.listingUserId
              : offer.offerUserId,
          name:
            offer.offerUserId === currentUser.id
              ? offer.listing.listingUser.name
              : offer.offerUser.name,
          image:
            offer.offerUserId === currentUser.id
              ? offer.listing.listingUser.image
              : offer.offerUser.image,
        },
        latestOffer: {
          offerId: offer.id,
          offerMessage: offer.offerMessage,
          offerDate: offer.offerDate,
        },
      });
    } else if (conversation.latestOffer.offerDate < offer.offerDate) {
      conversation.latestOffer = {
        offerId: offer.id,
        offerMessage: offer.offerMessage,
        offerDate: offer.offerDate,
      };
    }
  });
  return conversations;
}
