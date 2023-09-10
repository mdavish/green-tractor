import { getCurrentUser } from "../auth";
import { getOffersByUserId, type FetchedOffers } from "./getOffersByUserId";
import {
  getMessagesByUserId,
  type FetchedMessages,
} from "./getMessagesByUserId";
import {
  getOfferUpdatesByUserId,
  type FetchedOfferUpdates,
} from "./getOfferUpdatesByUserId";

export type FetchedOfferWithType = FetchedOffers[number] & {
  type: "offer";
};

export type FetchedMessageWithType = FetchedMessages[number] & {
  type: "message";
};

export type FetchedOfferUpdateWithType = FetchedOfferUpdates[number] & {
  type: "offerUpdate";
};

export type ConversationElement =
  | FetchedOfferWithType
  | FetchedMessageWithType
  | FetchedOfferUpdateWithType;

export function getConversationElementTimestamp(element: ConversationElement) {
  switch (element.type) {
    case "offer":
      return element.offerDate;
    case "message":
      return element.sentAt;
    case "offerUpdate":
      return element.updatedAt;
    default:
      throw new Error("Invalid conversation element type");
  }
}

export default async function getConversationByUserId(
  userId: string
): Promise<ConversationElement[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be logged in to get a conversation");
  }

  // Right now, conversations are just lists of offers
  // In the future, they will be a union of offers and messages and other things

  const offers = await getOffersByUserId(userId, currentUser);
  const offersWithType: FetchedOfferWithType[] = offers.map((offer) => ({
    ...offer,
    type: "offer",
  }));
  const messages = await getMessagesByUserId(userId, currentUser);
  const messagesWithType: FetchedMessageWithType[] = messages.map(
    (message) => ({
      ...message,
      type: "message",
    })
  );
  const offerUpdates = await getOfferUpdatesByUserId(userId, currentUser);
  const offerUpdatesWithType: FetchedOfferUpdateWithType[] = offerUpdates.map(
    (offerUpdate) => ({
      ...offerUpdate,
      type: "offerUpdate",
    })
  );

  const conversation: ConversationElement[] = [
    ...offersWithType,
    ...messagesWithType,
    ...offerUpdatesWithType,
  ];

  // NOTE: Ideally this would happen in SQL, but Prisma makes that hard
  // (Prisma requires three separate queries for each type of conversation element)
  // Sort the conversation by date
  conversation.sort((a, b) => {
    const aTimestamp = getConversationElementTimestamp(a);
    const bTimestamp = getConversationElementTimestamp(b);
    if (aTimestamp < bTimestamp) {
      return -1;
    }
    if (aTimestamp > bTimestamp) {
      return 1;
    }
    return 0;
  });

  return conversation;
}

export type Conversation = Awaited<ReturnType<typeof getConversationByUserId>>;
