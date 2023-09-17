"use server";
import { getCurrentUser } from "@/lib/auth";
import type { OfferUpdate } from "@prisma/client";
import { prisma, type ExpandedOfferUpdate } from "@/lib/prisma";

export type OfferUpdateInput = Omit<
  OfferUpdate,
  | "actorUserId"
  | "id"
  | "seen"
  | "updatedAt"
  | "stripeSessionDetails"
  | "stripeSessionId"
>;

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

  const offerUpdate = await prisma.createOfferUpdate({
    data: {
      actorUserId: currentUser.id,
      newStatus,
      offerId,
      message,
      newPrice,
    },
  });

  return {
    status: "success",
    ...offerUpdate,
  };
}
