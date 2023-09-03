import { getCurrentUser } from "../auth";
import { getOffersByUserId, type FetchedOffers } from "./getOffersByUserId";
import {
  getMessagesByUserId,
  type FetchedMessages,
} from "./getMessagesByUserId";

export type FetchedOfferWithType = FetchedOffers[number] & {
  type: "offer";
};

export type FetchedMessageWithType = FetchedMessages[number] & {
  type: "message";
};

export type ConversationElement = FetchedOfferWithType | FetchedMessageWithType;

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

  const conversation: ConversationElement[] = [
    ...offersWithType,
    ...messagesWithType,
  ];

  // Sort the conversation by date
  conversation.sort((a, b) => {
    const aTimestamp = a.type === "message" ? a.sentAt : a.offerDate;
    const bTimestamp = b.type === "message" ? b.sentAt : b.offerDate;
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
