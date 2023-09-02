"use client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import type { Conversation } from "@/lib/db/getConversationByUserId";

export default function ConversationPanel({
  offers,
  userId,
}: {
  offers: Conversation; // This is confusing - in the future, this will be a union of offers and messages and other things
  userId: string; // The OTHER user's ID, not the current user
}) {
  return (
    <div className="w-full h-full flex flex-col justify-end">
      <div className="flex flex-col gap-y-4 p-4 w-full">
        {offers.map((offer) => {
          const isFromUser = offer.offerUserId !== userId;
          return (
            <div
              key={offer.id}
              className={cn(
                "flex flex-row py-3 px-6 border-slate-200 text-sm w-fit rounded-lg shadow-sm max-w-md relative mb-1",
                isFromUser ? "ml-auto bg-primary text-white" : "bg-slate-100"
              )}
            >
              <UserAvatar
                user={offer.offerUser}
                className={cn(
                  "absolute w-8 h-8 -bottom-4 border border-white",
                  isFromUser ? "-right-2" : "-left-2"
                )}
              />
              <div className="flex flex-col gap-y-2">
                <p className="text-base">
                  {/* TODO: Get the other user's name */}
                  {isFromUser ? "You" : offer.offerUser.name} made an offer on{" "}
                  {` `}
                  <Link
                    className="group"
                    href={`/dashboard/listings/${offer.listingId}`}
                  >
                    <span
                      className={cn(
                        "group-hover:underline",
                        !isFromUser ? "text-primary " : "text-white"
                      )}
                    >
                      {offer.listing.title}
                    </span>
                  </Link>
                </p>
                <p>{offer.offerMessage}</p>
                <p
                  className={cn(
                    "text-xs ",
                    isFromUser ? "text-slate-200" : "text-slate-500"
                  )}
                >
                  Price: ${offer.offerPrice}
                </p>
                {!isFromUser && (
                  <div className="flex flex-row gap-x-2 mt-2">
                    <Button>Accept</Button>
                    <Button variant="destructive">Decline</Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {offers.length === 0 && (
        <div>
          <p>You haven&apos;t had any conversation with this user yet.</p>
        </div>
      )}
      <div className="w-full h-fit p-3 border-t">
        {/* Disabling this until we have interactive messaging */}
        <Input
          onSubmit={(event) => {
            console.log(event);
          }}
          placeholder="Send a message"
        />
      </div>
    </div>
  );
}
