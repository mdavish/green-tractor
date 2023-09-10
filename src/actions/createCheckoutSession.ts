"use server";
import stripeClient from "@/lib/stripe";
import type Stripe from "stripe";
import { getCurrentUser } from "@/lib/auth";
import { FetchedOfferUpdateWithType } from "@/lib/db/getConversationByUserId";

export type CheckoutSessionReturn =
  | {
      status: "success";
      session: Stripe.Response<Stripe.Checkout.Session>;
    }
  | {
      status: "error";
      message: string;
    };

export default async function createCheckoutSession(
  offerUpdate: FetchedOfferUpdateWithType
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to make a purchase");
  }

  if (offerUpdate.offer.listing.listingUser.stripeAccountId === null) {
    console.error(`
    The user with id ${offerUpdate.offer.listing.listingUser.id} does not have a Stripe account.
    Something has gone wrong. Users without Stripe accounts should not be able to create listings.
    `);
    return {
      status: "error",
      message:
        "It looks like the other user hasn't set up their business account yet and can't receive payments. We've notified them of this issue. Please try again later.",
    };
  }

  const price = offerUpdate.newPrice ?? offerUpdate.offer.offerPrice;

  const session = await stripeClient.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: price * 100,
          currency: "usd",
          product_data: {
            name: offerUpdate.offer.listing.title,
            description: offerUpdate.offer.listing.description,
            metadata: {
              listingId: offerUpdate.offer.listing.id,
            },
            // TODO: Add images
          },
        },
      },
    ],
    payment_intent_data: {
      // TODO: Revisit the 5% fee
      // (This is the most important assumption in our whole business model)
      application_fee_amount: price * 100 * 0.05,
      transfer_data: {
        // TODO: Confirm that this is the correct destination
        destination: offerUpdate.offer.listing.listingUser.stripeAccountId,
      },
    },
    // What should these be....
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });
  return {
    status: "success",
    session: session,
  };
}
