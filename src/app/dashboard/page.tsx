import Page from "@/components/Page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ListingPreview from "@/components/ListingPreview";

export default async function DashboardHomePage() {
  const allListings = await prisma.listing.findMany({
    include: {
      listingUser: true,
      Offer: true,
    },
  });
  const currentUser = await getCurrentUser();

  return (
    <Page title="Browse Listings">
      <div className="flex flex-col gap-y-4 max-w-3xl">
        {allListings.map((listing) => {
          return (
            <ListingPreview
              key={listing.id}
              listing={listing}
              currentUser={currentUser!}
              offers={listing.Offer}
            />
          );
        })}
      </div>
    </Page>
  );
}
