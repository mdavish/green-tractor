"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { FaEllipsisH } from "react-icons/fa";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function UserBadge({ className }: { className?: string }) {
  const session = useSession();

  if (session.status !== "authenticated") {
    // TODO: Add loading state and error state
    return <></>;
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex flex-row gap-x-2 rounded-xl hover:bg-slate-100 w-full p-2",
          className
        )}
      >
        <Avatar>
          <AvatarImage src={session.data.user?.image!} />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col gap-y-1 text-left w-fit">
          <div className="text-slate-900 text-sm text-">
            {session.data.user?.name}
          </div>
          <div className="text-slate-700 text-xs">
            {session.data.user?.email}
          </div>
        </div>
        <div className="ml-auto my-auto mr-1">
          <FaEllipsisH className="text-slate-700 text-xs" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-fit flex flex-col gap-y-2 p-2">
        <button
          className="text-slate-900 text-sm hover:bg-slate-100 rounded-xl p-2"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </PopoverContent>
    </Popover>
  );
}
