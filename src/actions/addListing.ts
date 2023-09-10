"use server";
import { ListingData, ListingSchema } from "@/schemas/Listing";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function addListing({
  title,
  description,
  listedDate,
  startingPrice,
  expirationDate,
  imageUrl,
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

  // What will this return?
  console.log({ imageUrl });

  const newListing = await prisma.listing.create({
    include: {
      listingUser: true,
    },
    data: {
      listingUserId: currentUser.id,
      title,
      description,
      expirationDate,
      startingPrice,
      listedDate,
      // TODO: Make this configuralbe
      startingPriceCurrency: "USD",
    },
  });

  return redirect(`/dashboard/listings/${newListing.id}`);
}
