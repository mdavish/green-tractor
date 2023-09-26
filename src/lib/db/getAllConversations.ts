/**
 * A conversation is the collection of both offers and messages unioned together.
 */
import { prisma } from "@/lib/prisma";
import { getCurrentUserStrict } from "@/lib/auth";

interface Conversation {
  otherUserId: string;
  otherUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  // TODO: Update this to look up latest offer, offerUpdate, OR message
  // (I.e. this should be "latestConversationElement", not "latestOffer")
  latestOffer: {
    offerId: string;
    offerMessage: string;
    offerDate: Date;
  };
}

export default async function getAllConversations(): Promise<Conversation[]> {
  const currentUser = await getCurrentUserStrict();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const offersToOrFrom = await prisma.offer.findMany({
    where: {
      OR: [
        {
          offerUserId: currentUser.id,
        },
        {
          listing: {
            listingUserId: currentUser.id,
          },
        },
      ],
    },
    include: {
      listing: {
        include: {
          listingUser: true,
        },
      },
      offerUser: true,
    },
  });

  const messagesToOrFrom = await prisma.message.findMany({
    where: {
      OR: [
        {
          fromUserId: currentUser.id,
        },
        {
          toUserId: currentUser.id,
        },
      ],
    },
    include: {
      fromUser: true,
      toUser: true,
    },
  });

  // Find the latest message OR offer for each other other user
  const conversations: Conversation[] = [];
  offersToOrFrom.forEach((offer) => {
    const otherUserId =
      offer.offerUserId === currentUser.id
        ? offer.listing.listingUserId
        : offer.offerUserId;
    const conversation = conversations.find(
      (c) => c.otherUserId === otherUserId
    );
    if (!conversation) {
      conversations.push({
        otherUserId,
        otherUser: {
          id:
            offer.offerUserId === currentUser.id
              ? offer.listing.listingUserId
              : offer.offerUserId,
          name:
            offer.offerUserId === currentUser.id
              ? offer.listing.listingUser.name
              : offer.offerUser.name,
          image:
            offer.offerUserId === currentUser.id
              ? offer.listing.listingUser.image
              : offer.offerUser.image,
        },
        latestOffer: {
          offerId: offer.id,
          offerMessage: offer.offerMessage,
          offerDate: offer.offerDate,
        },
      });
    } else if (conversation.latestOffer.offerDate < offer.offerDate) {
      conversation.latestOffer = {
        offerId: offer.id,
        offerMessage: offer.offerMessage,
        offerDate: offer.offerDate,
      };
    }
  });
  messagesToOrFrom.forEach((message) => {
    const otherUserId =
      message.fromUserId === currentUser.id
        ? message.toUserId
        : message.fromUserId;
    const conversation = conversations.find(
      (c) => c.otherUserId === otherUserId
    );
    if (!conversation) {
      conversations.push({
        otherUserId,
        otherUser: {
          id:
            message.fromUserId === currentUser.id
              ? message.toUserId
              : message.fromUserId,
          name:
            message.fromUserId === currentUser.id
              ? message.toUser.name
              : message.fromUser.name,
          image:
            message.fromUserId === currentUser.id
              ? message.toUser.image
              : message.fromUser.image,
        },
        latestOffer: {
          offerId: "",
          offerMessage: message.message,
          offerDate: message.sentAt,
        },
      });
    } else if (conversation.latestOffer.offerDate < message.sentAt) {
      conversation.latestOffer = {
        offerId: "",
        offerMessage: message.message,
        offerDate: message.sentAt,
      };
    }
  });

  return conversations;
}
