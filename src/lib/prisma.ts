import { PrismaClient } from "@prisma/client";
import type {
  Prisma,
  Offer,
  Message,
  OfferUpdate,
  User,
  Listing,
} from "@prisma/client";
import { pusherServer } from "./pusher";
import { inngestClient } from "@/lib/inngest";

export type ExpandedOfferUpdate = OfferUpdate & {
  actorUser: User;
  offer: Offer & {
    offerUser: User;
    listing: Listing & {
      listingUser: User;
    };
  };
};

export type ExpandedOffer = Offer & {
  offerUser: User;
  listing: Listing & {
    listingUser: User;
  };
};

export type ExpandedMessage = Message & {
  fromUser: User;
  toUser: User;
};

/**
 * The PrismaSuperClient exists to add side effects to certain Prisma methods.
 * For example, we need to do things like...
 * - Queue up an email notification when an offer update happens
 * - Trigger a Pusher notification when a new offer/offer update happens
 * - Trigger a Pusher notification when a new message is sent
 *
 * This logic used to live in the server actions - which was fine, but
 * it's nice to have all the pusher/Inngest/Resend logic in a single file,
 * so we can make sure it's standardized across different types of actions.
 *
 * Side effects that should be included in this class:
 * - Pusher notifications
 * - Inngest notifications
 * - Other database updates that must ALWAYS happen
 *
 * Side effects that should NOT be included here, at least for now:
 * - Validations (e.g. "you can only pay an offer with status ACCEPTED")
 * (this is because validations often need to be returned to the front-end,
 * and they may be handled differently depending on who the caller is)
 *
 * - Identifying the current user through cookies/auth (because again
 * this could differ depending on where the action is being called)
 */
class PrismaSuperClient extends PrismaClient {
  private pusher: typeof pusherServer;

  constructor() {
    super();
    this.pusher = pusherServer;
  }

  /**
   * When an offer update is created, four side effects happen:
   * - 1. An email notification is queued up
   * - 2. A Pusher notification is triggered
   * - 3. We update the offer's status
   * - 4. We update the listing's status
   */
  public async createOfferUpdate({
    data,
  }: {
    data: Prisma.OfferUpdateCreateArgs["data"];
  }): Promise<ExpandedOfferUpdate> {
    const offerUpdate = await this.offerUpdate.create({
      data,
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

    // In addition to creating the offerUpdate, we also need to update the offer's status

    // TODO: Eventually we should make it so that we don't have to update all three records
    // We should just be able to infer the offer and listing's statuses by the latest offerUpdate
    await prisma.offer.update({
      where: { id: offerUpdate.offerId },
      data: {
        status: offerUpdate.newStatus,
      },
    });

    // This is actually the only circumstance under which we update the listing's status.
    if (offerUpdate.newStatus === "PAID") {
      const updatedListing = await prisma.listing.update({
        where: {
          id: offerUpdate.offer.listingId,
        },
        data: {
          status: "SOLD",
        },
      });
    }

    // When an offer is updated, there are three parties involved,
    // but two of them are always the same person.
    // For example, someone accepts an offer, they are the actor user
    // and also the listing user, and the offer user is the other person.
    // If someone pays an offer, they must be the offer user and the actor user,
    // and the listing user is the other person.
    // Therefore, we need to find the "other" user - the person who is not the actor user.
    // This COULD be the offer user or the listing user, depending on the situation.
    // The "other" user receives the one way notification.
    // And the "other" user is the "to" user in the two way notification.
    const { actorUser } = offerUpdate;
    const { offerUser } = offerUpdate.offer;
    const { listingUser } = offerUpdate.offer.listing;

    const actorUserId = actorUser.id;
    const otherUserId =
      actorUser.id === offerUser.id ? listingUser.id : offerUser.id;

    const oneWayChannel = this.pusher.getOneWayChannel(otherUserId);
    const twoWayChannel = this.pusher.getTwoWayChannel(
      actorUserId,
      otherUserId
    );

    this.pusher.typedTrigger({
      channel: oneWayChannel,
      type: "offerUpdate",
      data: offerUpdate,
    });

    this.pusher.typedTrigger({
      channel: twoWayChannel,
      type: "offerUpdate",
      data: offerUpdate,
    });

    inngestClient.send({
      name: "offer.update",
      data: offerUpdate,
    });

    return offerUpdate;
  }

  /**
   * When an offer is created, two side effects happen:
   * - 1. An email notification is queued up
   * - 2. A Pusher notification is triggered
   */
  public async createOffer({
    data,
  }: {
    data: Prisma.OfferCreateArgs["data"];
  }): Promise<ExpandedOffer> {
    const offer = await this.offer.create({
      data,
      include: {
        offerUser: true,
        listing: {
          include: {
            listingUser: true,
          },
        },
      },
    });

    const { offerUser } = offer;
    const { listingUser } = offer.listing;

    const oneWayChannel = this.pusher.getOneWayChannel(listingUser.id);
    const twoWayChannel = this.pusher.getTwoWayChannel(
      offerUser.id,
      listingUser.id
    );

    this.pusher.typedTrigger({
      channel: oneWayChannel,
      type: "offer",
      data: offer,
    });

    this.pusher.typedTrigger({
      channel: twoWayChannel,
      type: "offer",
      data: offer,
    });

    inngestClient.send({
      name: "offer.new",
      data: offer,
    });

    return offer;
  }

  /**
   * When a message is created, only one side effects happen:
   * - 1. A Pusher notification is triggered
   */
  public async createMessage({
    data,
  }: {
    data: Prisma.MessageCreateArgs["data"];
  }): Promise<Message> {
    const message = await this.message.create({
      data,
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    const { fromUser, toUser } = message;

    const oneWayChannel = this.pusher.getOneWayChannel(toUser.id);
    const twoWayChannel = this.pusher.getTwoWayChannel(fromUser.id, toUser.id);

    this.pusher.typedTrigger({
      channel: oneWayChannel,
      type: "message",
      data: message,
    });

    this.pusher.typedTrigger({
      channel: twoWayChannel,
      type: "message",
      data: message,
    });

    return message;
  }
}

export const prisma = new PrismaSuperClient();
