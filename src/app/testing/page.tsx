// This page exists to test the email templates.
// I'm not aware of a better way to do this.
import { prisma } from "@/lib/prisma";
import OfferEmail from "@/components/email/OfferEmail";
import OfferUpdateEmail from "@/components/email/OfferUpdateEmail";

export default async function TestingPage() {
  // const offer = await prisma.offer.findFirst({
  //   include: {
  //     offerUser: true,
  //     listing: {
  //       include: {
  //         listingUser: true,
  //       },
  //     },
  //   },
  // });

  // if (!offer) {
  //   throw new Error("No offers found");
  // }

  const sampleOfferUpdates = await prisma.offerUpdate.findMany({
    include: {
      actorUser: true,
      offer: {
        include: {
          offerUser: true,
          listing: {
            include: {
              listingUser: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-10 my-10">
      {/* <OfferEmail className="mx-auto my-auto" offer={offer} /> */}
      {sampleOfferUpdates.map((offerUpdate) => (
        <OfferUpdateEmail
          key={offerUpdate.id}
          offerUpdate={offerUpdate}
          recipientUser={
            ["ACCEPTED", "REJECTED", "COUNTERED"].includes(
              offerUpdate.newStatus
            )
              ? offerUpdate.offer.offerUser
              : offerUpdate.offer.listing.listingUser
          }
        />
      ))}
    </div>
  );
}
