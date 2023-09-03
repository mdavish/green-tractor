"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { FetchedOfferWithType } from "@/lib/db/getConversationByUserId";
import { Textarea } from "../ui/textarea";

export default function AcceptOfferButton({
  offer,
}: {
  offer: FetchedOfferWithType;
}) {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <Dialog
      modal
      open={showDialog}
      defaultOpen={false}
      onOpenChange={setShowDialog}
    >
      <DialogTrigger asChild>
        <Button>Accept</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-y-2">
        <DialogHeader>
          <DialogTitle>Accept Offer</DialogTitle>
          <DialogDescription className="flex flex-col gap-y-2">
            <p>
              Are you sure you want to accept {offer.offerUser.name}&apos;s
              offer of ${offer.offerPrice} for{" "}
              <span>{offer.listing.title}</span>?
            </p>
            <p>
              If you accept, {offer.offerUser.name} will be notified and will
              send payment for your item. We&apos;ll hold onto the money until
              you and
              {offer.offerUser.name} confirm that the item has been shipped.
            </p>
          </DialogDescription>
        </DialogHeader>
        <Textarea placeholder={`Add a message to ${offer.offerUser.name}...`} />
        <DialogFooter className="mt-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // TODO: Accept offer
              setShowDialog(false);
            }}
          >
            Confirm and Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
