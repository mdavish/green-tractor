"use server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function sendMessage({
  message,
  toUserId,
}: {
  message: string;
  toUserId: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to send a message");
  }

  const createdMessage = await prisma.createMessage({
    data: {
      message,
      toUserId,
      sentAt: new Date(),
      fromUserId: user.id,
    },
  });

  // Not revalidating the path here because it's not a static page
  return createdMessage;
}

export type SendMessageResponse = Awaited<ReturnType<typeof sendMessage>>;
