"use server";
import { getCurrentUser } from "@/lib/auth";
import type { OfferUpdate } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type OfferUpdateInput = Omit<
  OfferUpdate,
  "actorUserId" | "id" | "seen" | "updatedAt"
>;

export default async function updateOffer({
  newStatus,
  offerId,
  message,
  newPrice,
}: OfferUpdateInput): Promise<OfferUpdate> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("You must be logged in to update an offer");
  }
  return await prisma.offerUpdate.create({
    data: {
      actorUserId: currentUser.id,
      newStatus,
      offerId,
      message,
      newPrice,
    },
  });
}
