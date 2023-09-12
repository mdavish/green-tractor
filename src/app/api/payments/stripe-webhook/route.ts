import { NextResponse } from "next/server";
import stripeClient from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

const SessionMetadata = z.object({
  payingUserId: z.string(),
  offerId: z.string(),
  listingId: z.string(),
  lastOfferUpdateId: z.string(),
});

export function GET(request: Request) {
  return NextResponse.json({
    response:
      "This is the Stripe webhook endpoint. You probably want to POST here.",
  });
}

export async function POST(request: Request) {
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "No Stripe signing secret found in request.",
      },
      {
        status: 400,
      }
    );
  }

  const body = await request.body?.getReader().read();

  if (!body) {
    return NextResponse.json(
      {
        error: "No body found in request.",
      },
      {
        status: 400,
      }
    );
  }

  const parsedBody = new TextDecoder("utf-8").decode(body.value);

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(
      parsedBody,
      signature,
      process.env.STRIPE_SIGNING_SECRET!
    );
  } catch (err) {
    console.error("Webhook verification failed.");
    console.log(err);
    return NextResponse.json(
      {
        error: "Webhook verification failed.",
      },
      {
        status: 400,
      }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const parsedMetaData = SessionMetadata.safeParse(session.metadata);
      if (!parsedMetaData.success) {
        console.error("Error parsing session metadata");
        console.error({
          error: parsedMetaData.error,
          metadata: session.metadata,
        });
        return NextResponse.json(
          {
            error:
              "Error parsing session metadata. Metadata requires payingUserId, offerId, listingId, and lastOfferUpdateId.",
          },
          {
            status: 500,
          }
        );
      } else {
        const { payingUserId, offerId, listingId } = parsedMetaData.data;

        // Before we update anything, we need to confirm two things:
        // 1. The offer's status should be "ACCEPTED". Nothing else is valid.
        // 2. The listing's status should be "OPEN". Nothing else is valid.
        const currentOffer = await prisma.offer.findUnique({
          where: {
            id: offerId,
          },
          include: {
            listing: true,
          },
        });

        if (!currentOffer) {
          console.error(`Offer with id ${offerId} not found.`);
          return NextResponse.json(
            {
              error: `Offer with id ${offerId} not found.`,
            },
            {
              status: 404,
            }
          );
        }

        if (currentOffer.status !== "ACCEPTED") {
          const message = `Stripe is attempting to pay ${offerId} whose status is ${currentOffer.status}. You can only pay offers with status ACCEPTED.`;
          console.error(message);
          return NextResponse.json(
            {
              error: message,
            },
            {
              status: 400,
            }
          );
        }

        if (currentOffer.listing.status !== "OPEN") {
          const message = `Stripe is attempting to pay ${offerId} whose listing's status is ${currentOffer.listing.status}. You can only pay offers whose listings have status OPEN.`;
          console.error(message);
          return NextResponse.json(
            {
              error: message,
            },
            {
              status: 400,
            }
          );
        }

        // Once those are confirmed, we make updates in four places:
        // 1. We create one final offer update with the new price and status
        // 2. We update the offer to status = paid
        // 3. We update the listing to status = sold
        // 4. We send a pusher notification to the other user
        // (Some day we should probably make these all happen in one transaction.)
        // (Lots of data duplication here, but it's okay for now.)
        const newOfferUpdate = await prisma.offerUpdate.create({
          data: {
            offerId,
            newStatus: "PAID",
            newPrice: (session.amount_total ?? 0) / 100,
            actorUserId: payingUserId,
          },
        });

        const updatedOffer = await prisma.offer.update({
          where: {
            id: offerId,
          },
          data: {
            status: "PAID",
          },
        });

        const updatedListing = await prisma.listing.update({
          where: {
            id: listingId,
          },
          data: {
            status: "SOLD",
          },
        });

        // TODO: Add pusher trigger

        console.log("Successfully updated offer, listing, and offer update.");
        console.log({ newOfferUpdate, updatedOffer, updatedListing });
        return NextResponse.json({
          response: "Successfully updated offer, listing, and offer update.",
          data: {
            newOfferUpdate,
            updatedOffer,
            updatedListing,
          },
        });
      }
    case "checkout.session.async_payment_succeeded":
      const asyncSession = event.data.object as Stripe.Checkout.Session;
      console.log({ asyncSession });
      break;
    case "checkout.session.async_payment_failed":
      const asyncFailedSession = event.data.object as Stripe.Checkout.Session;
      console.log({ asyncFailedSession });
      break;
    default:
      console.log(
        `Unhandled event type ${event.type}. (This is not an error.)`
      );
      return NextResponse.json({
        response: `Unhandled event type ${event.type}. This is okay - not all events are handled.`,
      });
  }
}
