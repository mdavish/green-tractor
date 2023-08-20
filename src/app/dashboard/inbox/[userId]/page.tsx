import getConversationByUserId from "@/lib/db/getConversationByUserId";

interface Params {
  params: {
    userId: string;
  };
}

export default async function ConversationPage({ params: { userId } }: Params) {
  // Right now, conversations are just lists of offers
  // In the future, they will be a union of offers and messages and other things

  const offers = await getConversationByUserId(userId);

  return (
    <div>
      {offers.map((offer) => {
        return (
          <div key={offer.id}>
            <p>{offer.id}</p>
            <p>{offer.offerMessage}</p>
          </div>
        );
      })}
    </div>
  );
}
