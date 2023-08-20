import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";

export default async function getConversationByUserId(userId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be logged in to get a conversation");
  }

  // Right now, conversations are just lists of offers
  // In the future, they will be a union of offers and messages and other things

  // Find all offers where this user is the buyer and the current user is the seller
  // OR where this user is the seller and the current user is the buyer
  const offers = await prisma.offer.findMany({
    where: {
      OR: [
        {
          AND: [
            {
              offerUserId: userId,
            },
            {
              listing: {
                listingUserId: currentUser.id,
              },
            },
          ],
        },
        {
          AND: [
            {
              offerUserId: currentUser.id,
            },
            {
              listing: {
                listingUserId: userId,
              },
            },
          ],
        },
      ],
    },
    include: {
      listing: true,
    },
  });
  return offers;
}
