import type { User, OfferStatus } from "@prisma/client";
import type { ExpandedOfferUpdate } from "@/lib/prisma";
import EmailTemplate from "./EmailTemplate";
import {
  Img,
  Column,
  Row,
  Text,
  Section,
  Container,
} from "@react-email/components";
import { sampleOfferUpdate, sampleUser } from "./sampleData";
import FormattedDate from "./EmailDate";
import Button from "./EmailButton";

// TODO: Make it possible to debug this in React Email dev tools
export default function OfferUpdateEmail({
  offerUpdate = sampleOfferUpdate,
  className,
  recipientUser = sampleUser,
}: {
  offerUpdate?: ExpandedOfferUpdate;
  className?: string;
  recipientUser: User;
}) {
  const listingBelongsToRecipient =
    offerUpdate.offer.listing.listingUserId === recipientUser.id;
  const offerBelongsToRecipient =
    offerUpdate.offer.offerUserId === recipientUser.id;

  if (listingBelongsToRecipient && offerBelongsToRecipient) {
    throw new Error(
      "It's impossible for the listing and the offer to both belong to the same person."
    );
  }

  if (!listingBelongsToRecipient && !offerBelongsToRecipient) {
    throw new Error(
      "It's impossible for the listing and the offer to both not belong to the same person."
    );
  }

  if (listingBelongsToRecipient) {
    const validActions: OfferStatus[] = ["PAID", "CANCELLED"];
    if (!validActions.includes(offerUpdate.newStatus)) {
      throw new Error(
        `You are trying to notify the recipient that this offer has moved to ${offerUpdate.newStatus}, 
        but that is not a valid status for the recipient to be notified about
        because the recipient is the one who made the listing. 
        You may have mixed up the recipient and the actor.`
      );
    }
  }

  if (offerBelongsToRecipient) {
    const validActions: OfferStatus[] = ["ACCEPTED", "REJECTED", "COUNTERED"];
    if (!validActions.includes(offerUpdate.newStatus)) {
      throw new Error(
        `You are trying to notify the recipient that this offer has moved to ${offerUpdate.newStatus}, 
        but that is not a valid status for the recipient to be notified about 
        because the recipient is the one who made the offer. 
        You may have mixed up the recipient and the actor.`
      );
    }
  }

  let message: string;
  switch (offerUpdate.newStatus) {
    case "ACCEPTED":
      message = `${offerUpdate.actorUser.name} accepted your offer of $${offerUpdate.offer.offerPrice} on their listing ${offerUpdate.offer.listing.title}.`;
      break;
    case "REJECTED":
      message = `${offerUpdate.actorUser.name} rejected your offer of $${offerUpdate.offer.offerPrice} on their listing ${offerUpdate.offer.listing.title}.`;
      break;
    case "COUNTERED":
      message = `${offerUpdate.actorUser.name} countered your offer of $${offerUpdate.offer.offerPrice} on their listing ${offerUpdate.offer.listing.title}.`;
      break;
    case "CANCELLED":
      message = `${offerUpdate.actorUser.name} cancelled their offer of $${offerUpdate.offer.offerPrice} on your listing ${offerUpdate.offer.listing.title}.`;
      break;
    case "PAID":
      message = `${offerUpdate.actorUser.name} paid for your listing ${offerUpdate.offer.listing.title}.`;
      break;
    case "OPEN":
      throw new Error(
        "An offerUpdate shouldn't have an OPEN status. This is an unhandled case and should've been caught earlier."
      );
    default:
      throw new Error("Invalid offer status");
  }

  return (
    <EmailTemplate
      className={className}
      headline={`Update about the Offer on ${offerUpdate.offer.listing.title}`}
      previewText={`Update about the Offer on ${offerUpdate.offer.listing.title}`}
      subheader={message}
    >
      <Container
        align="center"
        className="border border-solid border-slate-200 rounded-md p-3 my-3 w-fit mx-auto"
      >
        <Row className="">
          <Img
            src={offerUpdate.actorUser.image!}
            width={40}
            height={40}
            className="rounded-full"
          />
        </Row>
        <Column className="flex flex-col text-sm p-3 gap-y-1">
          <Text className="">
            <span className="font-medium text-slate-800">
              {offerUpdate.actorUser.name}{" "}
              <FormattedDate date={offerUpdate.updatedAt} />
            </span>
            <br />
            <span>{offerUpdate.message}</span>
          </Text>
        </Column>
      </Container>
      <Section className="text-center">
        <Button
          href={`https://greentractor.us/dashboard/inbox/${offerUpdate.actorUser.id}`}
        >
          View Offer
        </Button>
      </Section>
    </EmailTemplate>
  );
}
