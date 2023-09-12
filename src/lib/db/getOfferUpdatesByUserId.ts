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
      // It's possible these four clauses could be made into two
      // But right now I'm just not sure
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
        // We also want to show offer updates where the actor acts on their OWN offer for YOUR listing
        // Which happens when someone pays their offer on your listing, after they've accepted it
        {
          AND: [
            {
              actorUserId: userId,
            },
            {
              offer: {
                listing: {
                  listingUserId: resolvedCurrentUser.id,
                },
              },
            },
          ],
        },
        {
          AND: [
            {
              actorUserId: resolvedCurrentUser.id,
            },
            {
              offer: {
                listing: {
                  listingUserId: userId,
                },
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
