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

export default function DeclineOfferButton({
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
        <Button variant="destructive">Decline</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-y-2">
        <DialogHeader>
          <DialogTitle>Decline Offer</DialogTitle>
          <DialogDescription className="flex flex-col gap-y-2">
            <p>
              Are you sure you want to decline {offer.offerUser.name}&apos;s
              offer of ${offer.offerPrice} for{" "}
              <span>{offer.listing.title}</span>?
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
            variant="destructive"
            onClick={() => {
              // TODO: Decline offer
              setShowDialog(false);
            }}
          >
            Confirm and Decline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
