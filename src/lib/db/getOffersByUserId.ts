import { getCurrentUserStrict } from "../auth";
import { prisma } from "../prisma";

export async function getOffersByUserId(
  userId: string,
  currentUser?: Awaited<ReturnType<typeof getCurrentUserStrict>>
) {
  const resolvedCurrentUser = currentUser || (await getCurrentUserStrict());

  if (!resolvedCurrentUser) {
    throw new Error("You must be logged in to get a conversation");
  }

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
                listingUserId: resolvedCurrentUser.id,
              },
            },
          ],
        },
        {
          AND: [
            {
              offerUserId: resolvedCurrentUser.id,
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
      offerUser: true,
      listing: {
        include: {
          listingUser: true,
        },
      },
    },
  });
  return offers;
}

export type FetchedOffers = Awaited<ReturnType<typeof getOffersByUserId>>;
