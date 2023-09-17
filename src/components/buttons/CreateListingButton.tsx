"use client";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { User } from "@prisma/client";
import setupStripe from "@/actions/setupStripe";
import { useRouter } from "next/navigation";

// This button simply handles showing a dialog if a user doesn't already
// have Stripe setup. Otherwise, it redirects to the new listing page.
export default function CreateListingButton({
  currentUser,
}: {
  currentUser: User;
}) {
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handleStripeSetup = () => {
    startTransition(async () => {
      const url = await setupStripe();
      router.push(url);
    });
  };

  if (currentUser.stripeAccountId) {
    return (
      <Link href="/dashboard/listings/new">
        <Button>Create a New Listing</Button>
      </Link>
    );
  } else {
    return (
      <>
        <AlertDialog
          defaultOpen={false}
          onOpenChange={setShowDialog}
          open={showDialog}
        >
          <AlertDialogTrigger asChild className="w-fit">
            <Button>Create a New Listing</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Set Up Your Business Account</AlertDialogTitle>
              <AlertDialogDescription>
                In order to list items on Green Tractor you&lsquo;ll first need
                to set up your business account. This only takes a few moments!
                We just need to get some information about your business so that
                we can route payments to you.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStripeSetup}>
                {!isPending ? "Get Started" : "Setting up..."}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
}
