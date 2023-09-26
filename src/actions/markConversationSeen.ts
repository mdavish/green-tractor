"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserStrict } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Looks at the conversation between the current user and the other user and marks all messages as seen.
 * (This is easier than marking individual messages as seen, and there is no scenario where you
 * are looking at a conversation and haven't seen all the messages in it.)
 */
export default async function markConversationSeen(otherUserId: string) {
  const currentUser = await getCurrentUserStrict();
  if (!currentUser) {
    throw new Error("Not logged in");
  }

  const messagesUpdate = await prisma.message.updateMany({
    where: {
      AND: [
        { toUserId: currentUser.id },
        { fromUserId: otherUserId },
        { seen: false },
      ],
    },
    data: {
      seen: true,
    },
  });

  const offersUpdate = await prisma.offer.updateMany({
    where: {
      AND: [
        { offerUserId: otherUserId },
        {
          listing: {
            listingUserId: currentUser.id,
          },
        },
        { seen: false },
      ],
    },
    data: {
      seen: true,
    },
  });

  revalidatePath(`/dashboard/inbox/${otherUserId}`);

  return { offersUpdate, messagesUpdate };
}
