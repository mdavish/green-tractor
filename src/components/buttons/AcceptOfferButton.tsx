"use client";
import { useState, useTransition } from "react";
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
import updateOffer from "@/actions/updateOffer";
import { useToast } from "../ui/use-toast";

export default function AcceptOfferButton({
  offer,
}: {
  offer: FetchedOfferWithType;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const update = await updateOffer({
        message,
        offerId: offer.id,
        newPrice: offer.offerPrice,
        newStatus: "ACCEPTED",
      });
      if (update.status === "error") {
        toast({
          title: "Error",
          description: update.error,
          variant: "destructive",
          duration: 5000,
        });
      } else if (update.status === "success") {
        setShowDialog(false);
        toast({
          title: "Offer Accepted",
          description: `You have accepted ${offer.offerUser.name}'s offer of $${offer.offerPrice} for ${offer.listing.title}. ${offer.offerUser.name} will send payment for your item and you will be notified when they do.`,
          duration: 5000,
        });
      } else {
        throw new Error("Unknown status. Something is wrong.");
      }
    });
  };

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
          <DialogDescription>
            <div className="my-4 flex flex-col gap-y-4">
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
            </div>
          </DialogDescription>
        </DialogHeader>
        <Textarea
          onChange={handleMessageChange}
          placeholder={`Add a message to ${offer.offerUser.name}...`}
        />
        <DialogFooter className="mt-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {!isPending ? "Confirm and Accept" : "Submitting..."}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
