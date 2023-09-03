"use server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

  const createdMessage = await prisma.message.create({
    data: {
      message,
      toUserId,
      sentAt: new Date(),
      fromUserId: user.id,
    },
  });

  revalidatePath(`/dashboard/inbox/${toUserId}`);

  return createdMessage;
}
