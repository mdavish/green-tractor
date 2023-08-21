"use client";
import Link from "next/link";
import { Listing, User, Offer } from "@prisma/client";
import { haversineDistance } from "@/lib/utils";
import { FaExclamationCircle } from "react-icons/fa";
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

interface ListingPreviewProps {
  listing: Listing & {
    listingUser: User;
  };
  currentUser: User;
  offers: Offer[];
}

export default function ListingPreview({
  listing,
  currentUser,
  offers,
}: ListingPreviewProps) {
  const shouldDisplayDistance =
    listing.listingUser.latitude &&
    listing.listingUser.longitude &&
    currentUser?.latitude &&
    currentUser?.longitude;

  const distance = shouldDisplayDistance
    ? haversineDistance(
        { lat: currentUser?.latitude!, lng: currentUser?.longitude! },
        {
          lat: listing.listingUser.latitude!,
          lng: listing.listingUser.longitude!,
        }
      )
    : null;

  const formattedDistance = distance?.toFixed(2);

  const form = useForm<Offer>({
    resolver: zodResolver(OfferFormSchema),
    defaultValues: {
      offerPrice: listing.startingPrice,
    },
  });

  const listingIsTheirs = listing.listingUser.id === currentUser.id;

  const [showDialog, setShowDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // TODO: Add logic with server actions
  const onSubmit = async (offer: Offer) => {
    startTransition(async () => {
      try {
        await createOffer(offer, listing, listing.listingUser);
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

  const totalOffers = offers.length;
  const currentUserHasOffered = offers.some(
    (offer) => offer.offerUserId === currentUser.id
  );

  return (
    <div
      key={listing.id}
      className="border border-slate-300 shadow-sm px-4 py-5 rounded-md w-full flex flex-col-reverse md:flex-row"
    >
      <div className="flex flex-col gap-y-2">
        <Link href={`/dashboard/listings/${listing.id}`}>
          <h1 className="hover:underline font-medium">{listing.title}</h1>
        </Link>
        <p className="tracking-tight text-sm text-slate-700">
          {listing.description}
        </p>
        <div className="mt-2 flex flex-col gap-y-2 text-xs text-slate-500 gap-x-4">
          <p className="text-xs text-slate-500">
            Listed By {listingIsTheirs ? "Me" : listing.listingUser.name}
          </p>
          {shouldDisplayDistance ? (
            <p className="text-xs text-slate-500">
              {listing.listingUser.city}, {listing.listingUser.region} -{" "}
              {formattedDistance} miles away
            </p>
          ) : (
            <p className="text-red-700 flex flex-row">
              <FaExclamationCircle className="mr-1 my-auto" />
              No Location Available
            </p>
          )}{" "}
          <div className="flex md:flex-row gap-x-4">
            <p>Posted {new Date(listing.listedDate).toLocaleDateString()}</p>
            <p>
              Expires {new Date(listing.expirationDate).toLocaleDateString()}
            </p>
          </div>
          {totalOffers > 0 && (
            <p className="text-xs text-slate-500">
              {totalOffers} offer{totalOffers > 1 ? "s" : ""} submitted
            </p>
          )}
        </div>
      </div>
      <div className="md:ml-auto mr-4 my-auto flex flex-col">
        <h2 className="ml-auto text-2xl font-medium md:text-center">
          ${listing.startingPrice}
        </h2>
        <p className="text-white mt-2 text-xs md:text-gray-600 ml-auto flex flex-row mb-4">
          Starting Price
        </p>
        {/* If the current user has already offered, just take them to their current offer */}
        {/* TODO: Deep link directly to specific conversation */}
        {currentUserHasOffered && (
          <Link href={`/dashboard/inbox/`}>
            <Button className="ml-auto w-fit">View My Offer</Button>
          </Link>
        )}
        {!currentUserHasOffered && (
          <Dialog
            open={showDialog}
            defaultOpen={false}
            onOpenChange={setShowDialog}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  if (listingIsTheirs) return;
                  setShowDialog(true);
                }}
                disabled={listingIsTheirs}
                className="ml-auto w-fit"
              >
                Submit Offer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bid on {listing.title}</DialogTitle>
                <DialogDescription>
                  Submit an offer for {listing.title} below. This will send a
                  message to the seller with your bid amount and contact
                  information.
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
        )}
      </div>
    </div>
  );
}
