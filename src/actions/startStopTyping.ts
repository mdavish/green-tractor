"use server";
import { pusherServer } from "@/lib/pusher";
import { getCurrentUser } from "@/lib/auth";

export default async function startStopTyping({
  isTyping,
  otherUserId,
}: {
  isTyping: boolean;
  otherUserId: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;
  const channel = pusherServer.getTwoWayChannel(currentUser.id, otherUserId);
  await pusherServer.typedTrigger({
    channel,
    type: "isTyping",
    data: isTyping,
  });
}
