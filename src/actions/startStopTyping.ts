"use server";
import { pusherServer } from "@/lib/pusher";
import { getCurrentUser } from "@/lib/auth";

export default async function startStopTyping({
  isTyping,
}: {
  isTyping: boolean;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;
  // TODO: Make this a channel that is unique to the conversation
  // (Right now, it's a channel that is unique to the user)
  const channelName = `isTyping-${currentUser.id}`;
  await pusherServer.trigger(channelName, "typing", {
    isTyping,
  });
}
