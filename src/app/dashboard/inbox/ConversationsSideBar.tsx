"use client";
import type getAllConversations from "@/lib/db/getAllConversations";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FormattedDate from "@/components/FormattedDate";

export function ConversationsSideBar({
  allConversations,
}: {
  allConversations: Awaited<ReturnType<typeof getAllConversations>>;
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col w-full">
      {allConversations.map((conv) => {
        return (
          <Link
            href={`/dashboard/inbox/${conv.otherUserId}`}
            className={cn(
              "rounded-lg mx-2 my-1 py-4 px-3 hover:bg-slate-100 cursor-pointer overflow-hidden text-sm overflow-ellipsis whitespace-nowrap flex flex-row gap-x-2",
              pathname.endsWith(conv.otherUserId) && "bg-slate-100"
            )}
            key={conv.otherUserId}
          >
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={conv.otherUser.image!} />
              <AvatarFallback />
            </Avatar>
            {/* TODO: Update this to read from messages */}
            <div className="flex flex-col gap-y-1 text-sm">
              <h2 className="font-medium ">
                {conv.otherUser.name}
                <FormattedDate date={conv.latestOffer.offerDate} />
              </h2>
              <p className="text-sm text-slate-600 whitespace-normal line-clamp-2">
                {conv.latestOffer.offerMessage}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
