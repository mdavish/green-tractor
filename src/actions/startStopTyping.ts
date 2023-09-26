"use server";
import { pusherServer } from "@/lib/pusher";
import { getCurrentUserStrict } from "@/lib/auth";

export default async function startStopTyping({
  isTyping,
  otherUserId,
}: {
  isTyping: boolean;
  otherUserId: string;
}) {
  const currentUser = await getCurrentUserStrict();
  if (!currentUser) return;
  const channel = pusherServer.getTwoWayChannel(currentUser.id, otherUserId);
  await pusherServer.typedTrigger({
    channel,
    type: "isTyping",
    data: isTyping,
  });
}
