import getAllConversations from "@/lib/db/getAllConversations";
import { ConversationsSideBar } from "@/components/messaging/ConversationsSideBar";
import { redirect } from "next/navigation";

export default async function InboxPage({
  params,
  children,
}: {
  children: React.ReactNode;
  params: { [key: string]: string };
}) {
  const allConversations = await getAllConversations();
  // TODO:
  // If there are some conversations, redirect to the first one
  // if (allConversations.length > 0 && !params.userId) {
  //   redirect(`/dashboard/inbox/${allConversations[0].otherUserId}`);
  // }
  return (
    <div className="w-full h-full flex flex-row">
      {/* TODO: Better responsive styling here */}
      <div className="w-40 md:w-80 shrink-0 h-full border-r border-slate-100 flex flex-col divide-y divide-slate-200">
        <div className="p-4 mb-2">
          <h2 className="font-normal text-xl text-slate-900">Conversations</h2>
        </div>
        {allConversations.length === 0 && (
          <div>
            <p className="p-4 text-slate-500">No conversations yet</p>
          </div>
        )}
        <ConversationsSideBar allConversations={allConversations} />
      </div>
      {children}
    </div>
  );
}
