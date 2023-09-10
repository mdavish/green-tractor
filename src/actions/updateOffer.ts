"use server";
import { getCurrentUser } from "@/lib/auth";
import type { OfferUpdate, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export type OfferUpdateInput = Omit<
  OfferUpdate,
  "actorUserId" | "id" | "seen" | "updatedAt"
>;

/**
 * The reason we need to extract this function is to generate an accurate return type
 */
async function createOfferUpdate({
  currentUser,
  newStatus,
  offerId,
  message,
  newPrice,
}: {
  currentUser: User;
  newStatus: OfferUpdateInput["newStatus"];
  offerId: OfferUpdateInput["offerId"];
  message: OfferUpdateInput["message"];
  newPrice: OfferUpdateInput["newPrice"];
}) {
  return await prisma.offerUpdate.create({
    data: {
      actorUserId: currentUser.id,
      newStatus,
      offerId,
      message,
      newPrice,
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
}

export type ExpandedOfferUpdate = Awaited<ReturnType<typeof createOfferUpdate>>;

export type OfferUpdateReturn =
  | {
      status: "error";
      error: string;
    }
  | ({
      status: "success";
    } & ExpandedOfferUpdate);

export default async function updateOffer({
  newStatus,
  offerId,
  message,
  newPrice,
}: OfferUpdateInput): Promise<OfferUpdateReturn> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("You must be logged in to update an offer");
  }
  const currentOffer = await prisma.offer.findUnique({
    where: { id: offerId },
  });

  if (!currentOffer) {
    throw new Error("Offer not found");
  }

  // TODO: Eventually make all of these throw errors instead of returning them
  // Because hopefully the UI will never allow them to happen
  switch (newStatus) {
    case "ACCEPTED":
      if (currentOffer.status !== "OPEN") {
        const { status } = currentOffer;
        return {
          status: "error",
          error: `This offer has already been ${status.toLowerCase()}. You can no longer accept it.`,
        };
      }
      break;
    case "CANCELLED": {
      if (currentOffer.status !== "OPEN") {
        const { status } = currentOffer;
        return {
          status: "error",
          error: `This offer has already been ${status.toLowerCase()}. You can no longer cancel it.`,
        };
      }
      break;
    }
    case "OPEN": {
      throw new Error(
        "You are attempting to set an offer back to open. This should never happen."
      );
    }
    case "REJECTED": {
      if (currentOffer.status !== "OPEN") {
        const { status } = currentOffer;
        return {
          status: "error",
          error: `This offer has already been ${status.toLowerCase()}. You can no longer reject it.`,
        };
      }
      break;
    }
    case "PAID": {
      if (currentOffer.status !== "ACCEPTED") {
        throw new Error(
          "You are attempting to set an offer to paid that is not accepted. This should never happen."
        );
      }
      break;
    }
  }

  const offerUpdate = await createOfferUpdate({
    currentUser,
    newStatus,
    offerId,
    message,
    newPrice,
  });

  // TODO: Eventually we should make it so that we don't have to update both records
  // We should just be able to infer the offer's status by the latest offerUpdate
  const offer = await prisma.offer.update({
    where: { id: offerId },
    data: {
      status: newStatus,
    },
  });

  // TODO: Confirm this logic actually makes sense.
  // When an offer update is made, who do you need to tell?
  // The offer's owner (if they weren't the one who made the update)
  // The listing's owner (if they weren't the one who made the update)
  // And that's it, right?
  const twoWayChannel = `offerUpdatesFrom-${currentUser.id}-to-${offer.offerUserId}`;
  const oneWayChannel = `offerUpdatesTo-${offer.offerUserId}`;

  await pusherServer.trigger(twoWayChannel, "newOfferUpdate", offerUpdate);
  await pusherServer.trigger(oneWayChannel, "newOfferUpdate", offerUpdate);

  return {
    status: "success",
    ...offerUpdate,
  };
}
