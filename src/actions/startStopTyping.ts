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
  const channelName = `isTyping-${currentUser.id}`;
  const pusherResponse = await pusherServer.trigger(channelName, "typing", {
    isTyping,
  });
}
