"use client";
import type getAllConversations from "@/lib/db/getAllConversations";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ConversationsSideBar({
  allConversations,
}: {
  allConversations: Awaited<ReturnType<typeof getAllConversations>>;
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col divide-y w-full">
      {allConversations.map((conv) => {
        return (
          <Link
            href={`/dashboard/inbox/${conv.otherUserId}`}
            className={cn(
              "p-4 hover:bg-slate-100 cursor-pointer overflow-hidden text-sm overflow-ellipsis whitespace-nowrap flex flex-row gap-x-2",
              pathname.endsWith(conv.otherUserId) && "bg-slate-100"
            )}
            key={conv.otherUserId}
          >
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={conv.otherUser.image!} />
              <AvatarFallback />
            </Avatar>
            <div className="flex flex-col gap-x-1">
              <h2>{conv.otherUser.name}</h2>
              <p className="text-xs italic text-slate-600 whitespace-normal line-clamp-2">
                {conv.latestOffer.offerMessage}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
