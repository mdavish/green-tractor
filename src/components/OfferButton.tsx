"use client";
import { Listing, User, Offer } from "@prisma/client";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OfferFormSchema, type OfferFormData } from "@/schemas/Offer";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useTransition, useState } from "react";
import createOffer from "@/actions/createOffer";
import { useToast } from "./ui/use-toast";

interface OfferButtonProps {
  buttonText?: string;
  listing: Listing & {
    listingUser: User;
  };
  currentUser: User;
  buttonClassName?: string;
}

export default function OfferButton({
  listing,
  currentUser,
  buttonText = "Submit Offer",
  buttonClassName,
}: OfferButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const form = useForm<Offer>({
    resolver: zodResolver(OfferFormSchema),
    defaultValues: {
      offerPrice: listing.startingPrice,
    },
  });

  const listingIsTheirs = listing.listingUser.id === currentUser.id;

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // TODO: Add logic with server actions
  const onSubmit = async (offer: Offer) => {
    startTransition(async () => {
      try {
        await createOffer(offer, listing);
        toast({
          title: "Offer Submitted",
          description:
            "Your offer has been submitted. The seller will be in touch with you shortly.",
        });
        setShowDialog(false);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error Submitting Offer",
          description:
            "There was an error submitting your offer. Please try again later.",
        });
        setShowDialog(false);
      }
    });
  };

  return (
    <Dialog open={showDialog} defaultOpen={false} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            if (listingIsTheirs) {
              throw new Error(
                "Cannot bid on your own listing. Something is wrong here."
              );
            }
            setShowDialog(true);
          }}
          disabled={listingIsTheirs}
          className={buttonClassName}
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bid on {listing.title}</DialogTitle>
          <DialogDescription>
            Submit an offer for {listing.title} below. This will send a message
            to the seller with your bid amount and contact information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-y-2 my-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="offerMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`Enter a message for ${listing.listingUser.name}...`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="offerPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {isPending ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
