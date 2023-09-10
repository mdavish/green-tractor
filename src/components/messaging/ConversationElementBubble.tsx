import type { ConversationElement } from "@/lib/db/getConversationByUserId";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { motion } from "framer-motion";
import FormattedDate from "../FormattedDate";
import AcceptOfferButton from "../buttons/AcceptOfferButton";
import DeclineOfferButton from "../buttons/DeclineOfferButton";
import type { User } from "@prisma/client";
import PaymentButton from "../buttons/PaymentButton";

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

  let elementUser: User;
  switch (type) {
    case "offer":
      elementUser = conversationElement.offerUser;
      break;
    case "message":
      elementUser = conversationElement.fromUser;
      break;
    case "offerUpdate":
      elementUser = conversationElement.actorUser;
      break;
    default:
      throw new Error("Invalid conversation element type");
  }

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
          "bg-slate-100 rounded-xl flex flex-row gap-x-4",
          className
        )}
      >
        <Avatar>
          <AvatarImage src={elementUser.image!} referrerPolicy="no-referrer" />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col gap-y-1">
          <FormattedDate date={conversationElement.offerDate} />
          <div className="text-xs  w-fit">
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
          <p className="text-sm">{conversationElement.offerMessage}</p>
          {!isFromCurrentUser && (
            <div className="flex flex-row gap-x-2 mt-2">
              <AcceptOfferButton offer={conversationElement} />
              <DeclineOfferButton offer={conversationElement} />
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
        className={cn(sharedStyle, "flex flex-row gap-x-2", className)}
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

  if (type === "offerUpdate") {
    const price =
      conversationElement.newPrice ?? conversationElement.offer.offerPrice;

    const actorIsCurrentUser = conversationElement.actorUserId !== otherUserId;
    const offerBelongsToCurrentUser =
      conversationElement.offer.offerUserId !== otherUserId;

    const subjectName = actorIsCurrentUser
      ? "You"
      : conversationElement.actorUser.name?.split(" ")[0];

    const objectPosessive = offerBelongsToCurrentUser
      ? "your"
      : `${conversationElement.offer.offerUser.name?.split(" ")[0]}'s`;

    let verb: string;
    switch (conversationElement.newStatus) {
      case "ACCEPTED":
        verb = "accepted";
        break;
      case "REJECTED":
        verb = "rejected";
        break;
      case "COUNTERED":
        verb = "countered";
        break;
      case "CANCELLED":
        verb = "cancelled";
        break;
      case "OPEN":
        throw new Error("An offerUpdate shouldn't have an OPEN status");
      case "PAID":
        verb = "paid";
        break;
      default:
        throw new Error("Invalid offer status");
    }

    const message = `${subjectName} ${verb} ${objectPosessive} offer on ${
      isFromCurrentUser ? "your" : "their"
    } listing: `;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          sharedStyle,
          "bg-slate-100 rounded-xl flex flex-row gap-x-4",
          className
        )}
      >
        <Avatar>
          <AvatarImage src={elementUser.image!} referrerPolicy="no-referrer" />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col gap-y-1">
          <FormattedDate date={conversationElement.updatedAt} />
          <div className="text-xs w-fit">
            {message}
            <Link
              className="font-semibold hover:underline cursor-pointer"
              href={`/dashboard/listings/${conversationElement.offer.listing.id}`}
            >
              {conversationElement.offer.listing.title}
            </Link>{" "}
            for <span className="font-semibold">${price.toLocaleString()}</span>
            .
          </div>
          <p className="text-sm">{conversationElement.message}</p>
          {conversationElement.newStatus === "ACCEPTED" &&
            !actorIsCurrentUser && (
              <div className="flex flex-row gap-x-2 mt-2">
                <PaymentButton {...conversationElement} />
              </div>
            )}
        </div>
      </motion.div>
    );
  }
}
