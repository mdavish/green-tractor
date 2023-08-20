import getAllConversations from "@/lib/db/getAllConversations";
import Link from "next/link";

export default async function InboxPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const allConversations = await getAllConversations();
  return (
    <div className="w-full h-full flex flex-row">
      <div className="w-1/4 h-full border-r border-slate-200 flex flex-col divide-y divide-slate-200">
        <div className="p-4">
          <h2 className="font-normal text-xl text-slate-900">Conversations</h2>
        </div>
        {allConversations.length === 0 && (
          <div>
            <p className="p-4 text-slate-500">No conversations yet</p>
          </div>
        )}
        <div className="flex flex-col divide-y">
          {allConversations.map((conv) => {
            return (
              <Link
                href={`/dashboard/inbox/${conv.offerUserId}`}
                className="p-4 hover:bg-slate-100 cursor-pointer overflow-hidden text-sm overflow-ellipsis whitespace-nowrap"
                key={conv.offerUserId}
              >
                {`Other User:${conv.otherUserId}`}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
