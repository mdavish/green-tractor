import getConversationByUserId from "@/lib/db/getConversationByUserId";
import ConversationPanel from "@/components/ConversationPanel";

interface Params {
  params: {
    userId: string;
  };
}

export default async function ConversationPage({ params: { userId } }: Params) {
  // Right now, conversations are just lists of offers
  // In the future, they will be a union of offers and messages and other things
  const conversation = await getConversationByUserId(userId);
  return <ConversationPanel conversation={conversation} userId={userId} />;
}
