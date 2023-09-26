"use server";
import stripeClient from "@/lib/stripe";
import type Stripe from "stripe";
import { getCurrentUserStrict } from "@/lib/auth";
import { FetchedOfferUpdateWithType } from "@/lib/db/getConversationByUserId";
import { prisma } from "@/lib/prisma";

const GREEN_TRACTOR_FEE = 0.05;

export type CheckoutSessionReturn =
  | {
      status: "success";
      session: Stripe.Response<Stripe.Checkout.Session>;
    }
  | {
      status: "error";
      message: string;
    };

export default async function createCheckoutSession({
  offerUpdate,
  successUrl,
  cancelUrl,
}: {
  offerUpdate: FetchedOfferUpdateWithType;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSessionReturn> {
  const user = await getCurrentUserStrict();

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

  if (!user.email) {
    throw new Error(
      `User ${user.id} does not have an email address. This should be impossible.`
    );
  }

  const offerId = offerUpdate.offer.id;
  // Before we update anything, we need to confirm two things:
  // 1. The offer's status should be "ACCEPTED". Nothing else is valid.
  // 2. The listing's status should be "OPEN". Nothing else is valid.
  const currentOffer = await prisma.offer.findUnique({
    where: {
      id: offerUpdate.offer.id,
    },
    include: {
      listing: true,
    },
  });

  if (!currentOffer) {
    return {
      status: "error",
      message: `Whoops, we couldn't find the offer you're trying to pay. We're looking into this. Please try again later.`,
    };
  }

  // Before we update anything, we need to confirm two things:
  // 1. The offer's status should be "ACCEPTED". Nothing else is valid.
  // 2. The listing's status should be "OPEN". Nothing else is valid.
  if (currentOffer.status !== "ACCEPTED") {
    switch (currentOffer.status) {
      case "OPEN":
        return {
          status: "error",
          message:
            "The other user hasn't accepted your offer yet. Once they accept it, you'll be able to pay.",
        };
      case "REJECTED":
        return {
          status: "error",
          message:
            "The other user has rejected your offer. You can't pay a rejected offer.",
        };
      case "CANCELLED":
        return {
          status: "error",
          message:
            "This offer has been cancelled. You can't pay a cancelled offer.",
        };
      case "PAID":
        return {
          status: "error",
          message:
            "This offer has already been paid. You can't pay an offer that's already been paid.",
        };
      default:
        throw new Error(
          `Invalid/unhandled status ${currentOffer.status}. I'm not capable of handling this yet.`
        );
    }
  }

  if (currentOffer.listing.status !== "OPEN") {
    switch (currentOffer.listing.status) {
      case "ARCHIVED":
        return {
          status: "error",
          message:
            "This listing has been deleted. You can't pay an archived listing.",
        };
      case "SOLD":
        return {
          status: "error",
          message:
            "This listing has already been sold. You can't pay a sold listing.",
        };
    }
  }

  const price = offerUpdate.newPrice ?? offerUpdate.offer.offerPrice;

  // This always needs to be passed, otherwise the webhook will not know
  // what database record to update
  const metadata = {
    payingUserId: user.id,
    offerId: offerUpdate.offer.id,
    lastOfferUpdateId: offerUpdate.id,
    listingId: offerUpdate.offer.listing.id,
  };

  const session = await stripeClient.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    metadata,
    // The listing ID is used as the "client reference ID" (unique ID for payment)
    client_reference_id: offerUpdate.offer.listing.id,
    currency: "usd",
    submit_type: "pay",
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
      application_fee_amount: price * 100 * GREEN_TRACTOR_FEE,
      transfer_data: {
        destination: offerUpdate.offer.listing.listingUser.stripeAccountId,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return {
    status: "success",
    session: session,
  };
}
