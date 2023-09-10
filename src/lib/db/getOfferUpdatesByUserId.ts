import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";

export async function getOfferUpdatesByUserId(
  userId: string,
  currentUser?: Awaited<ReturnType<typeof getCurrentUser>>
) {
  const resolvedCurrentUser = currentUser || (await getCurrentUser());

  if (!resolvedCurrentUser) {
    throw new Error("You must be logged in to get a conversation");
  }

  // Find all the offer updates where either the actor is the current user and the offer is from the other user
  // Or the actor is the other user and the offer is from the current user
  const offerUpdates = await prisma.offerUpdate.findMany({
    where: {
      OR: [
        {
          AND: [
            {
              actorUserId: resolvedCurrentUser.id,
            },
            {
              offer: {
                offerUserId: userId,
              },
            },
          ],
        },
        {
          AND: [
            {
              actorUserId: userId,
            },
            {
              offer: {
                offerUserId: resolvedCurrentUser.id,
              },
            },
          ],
        },
      ],
    },
    include: {
      actorUser: true,
      offer: {
        include: {
          listing: {
            include: {
              listingUser: true,
            },
          },
          offerUser: true,
        },
      },
    },
  });
  return offerUpdates;
}

export type FetchedOfferUpdates = Awaited<
  ReturnType<typeof getOfferUpdatesByUserId>
>;
