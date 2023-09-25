"use server";
import { ListingData } from "@/schemas/Listing";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CloudinaryAsset } from "@prisma/client";
import { redirect } from "next/navigation";

export async function addListing({
  description,
  expirationDate,
  imageDetails,
  listedDate,
  startingPrice,
  title,
}: ListingData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("No current user");
  }

  if (!currentUser.stripeAccountId) {
    throw new Error(
      `User ${currentUser.id} does not have a Stripe account, so they cannot create listings.`
    );
  }

  let newAsset: CloudinaryAsset | undefined;
  if (imageDetails) {
    newAsset = await prisma.cloudinaryAsset.create({
      data: imageDetails,
    });
  }

  const newListing = await prisma.createListing({
    data: {
      listingUserId: currentUser.id,
      title,
      description,
      expirationDate,
      startingPrice,
      listedDate,
      // TODO: Make this configuralbe
      startingPriceCurrency: "USD",
      mainImageId: newAsset?.asset_id,
    },
  });

  return redirect(`/dashboard/listings/${newListing.id}`);
}
