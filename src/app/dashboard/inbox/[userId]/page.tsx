import getConversationByUserId from "@/lib/db/getConversationByUserId";
import ConversationPanel from "@/components/ConversationPanel";
import { getCurrentUser } from "@/lib/auth";
import getUserById from "@/lib/db/getUserById";

interface Params {
  params: {
    userId: string;
  };
}

export default async function ConversationPage({ params: { userId } }: Params) {
  // Right now, conversations are just lists of offers
  // In the future, they will be a union of offers and messages and other things
  const conversation = await getConversationByUserId(userId);
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("No current user");
  }
  const otherUser = await getUserById(userId);
  return (
    <ConversationPanel
      conversation={conversation}
      otherUser={otherUser}
      currentUser={currentUser}
    />
  );
}
