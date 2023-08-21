import Page from "@/components/Page";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ListingPreview from "@/components/ListingPreview";

export default async function aMyListingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");
  const listings = await prisma.listing.findMany({
    where: {
      listingUserId: currentUser.id,
    },
    include: {
      listingUser: true,
      Offer: true,
    },
  });
  return (
    <Page title="My Listings">
      <Link href="/dashboard/listings/new">
        <Button>List a New Item</Button>
      </Link>
      <div className="flex flex-col my-4 gap-y-4 max-w-3xl">
        {listings.map((listing, index) => {
          return (
            <ListingPreview
              listing={listing}
              key={index}
              currentUser={currentUser}
              offers={listing.Offer}
            />
          );
        })}
      </div>
    </Page>
  );
}
