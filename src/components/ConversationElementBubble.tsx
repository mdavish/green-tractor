import type { ConversationElement } from "@/lib/db/getConversationByUserId";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import FormattedDate from "./FormattedDate";

export default function ConversationElementBubble({
  conversationElement,
  className,
  otherUserId,
  index,
}: {
  conversationElement: ConversationElement;
  // The ID of the other user
  // (We assume that the current user is the one who is logged in)
  otherUserId: string;
  className?: string;
  index: number;
}) {
  const { type } = conversationElement;

  const elementUser =
    type === "message"
      ? conversationElement.fromUser
      : conversationElement.offerUser;

  const isFromCurrentUser = elementUser.id !== otherUserId;

  const sharedStyle = "text-sm text-slate-800 px-4 py-3";

  if (type === "offer") {
    // TODO: Fix this
    // Something is going wrong with the naming
    // (It's never showing the other user's name)
    const offererName = isFromCurrentUser
      ? "You"
      : elementUser.name?.split(" ")[0];
    const receiverName = isFromCurrentUser
      ? elementUser.name?.split(" ")[0]
      : "you";
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          sharedStyle,
          "bg-slate-50 rounded-xl flex flex-row gap-x-4"
        )}
      >
        <Avatar>
          <AvatarImage src={elementUser.image!} referrerPolicy="no-referrer" />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col gap-y-1">
          <FormattedDate date={conversationElement.offerDate} />
          <div>
            {offererName} made {receiverName} an offer on{" "}
            {isFromCurrentUser ? "your" : "their"} listing:{" "}
            <Link
              className="font-semibold hover:underline cursor-pointer"
              href={`/dashboard/listings/${conversationElement.listing.id}`}
            >
              {conversationElement.listing.title}
            </Link>{" "}
            for{" "}
            <span className="font-semibold">
              ${conversationElement.offerPrice.toLocaleString()}
            </span>
            .
          </div>
          {!isFromCurrentUser && (
            <div className="flex flex-row gap-x-2 mt-2">
              <Button>Accept</Button>
              <Button variant="destructive">Decline</Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (type === "message") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(sharedStyle, "flex flex-row gap-x-2")}
      >
        <Avatar>
          <AvatarImage src={elementUser.image!} referrerPolicy="no-referrer" />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col gap-y-1 text-sm">
          <div className="font-medium text-slate-800">
            {elementUser.name}{" "}
            <FormattedDate date={conversationElement.sentAt} />
          </div>
          <div>{conversationElement.message}</div>
        </div>
      </motion.div>
    );
  }
}
