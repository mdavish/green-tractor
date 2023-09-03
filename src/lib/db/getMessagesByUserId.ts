import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";

export async function getMessagesByUserId(
  userId: string,
  currentUser?: Awaited<ReturnType<typeof getCurrentUser>>
) {
  const resolvedCurrentUser = currentUser || (await getCurrentUser());

  if (!resolvedCurrentUser) {
    throw new Error("You must be logged in to get a conversation");
  }
  // Now find all messages where this user is the sender and the current user is the recipient
  // OR where this user is the recipient and the current user is the sender
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        {
          AND: [
            {
              fromUserId: userId,
            },
            {
              toUserId: resolvedCurrentUser.id,
            },
          ],
        },
        {
          AND: [
            {
              fromUserId: resolvedCurrentUser.id,
            },
            {
              toUserId: userId,
            },
          ],
        },
      ],
    },
    include: {
      fromUser: true,
      toUser: true,
    },
  });
  return messages;
}

export type FetchedMessages = Awaited<ReturnType<typeof getMessagesByUserId>>;
