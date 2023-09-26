import Page from "@/components/Page";
import { prisma } from "@/lib/prisma";
import { getCurrentUserStrict } from "@/lib/auth";
import ListingPreview from "@/components/ListingPreview";
import CreateListingButton from "@/components/buttons/CreateListingButton";

export default async function MyListingsPage() {
  const currentUser = await getCurrentUserStrict();
  if (!currentUser) throw new Error("Not authenticated");
  const listings = await prisma.listing.findMany({
    where: {
      listingUserId: currentUser.id,
    },
    include: {
      mainImage: true,
      listingUser: true,
      Offer: true,
    },
    orderBy: {
      listedDate: "desc",
    },
  });

  return (
    <Page title="My Listings">
      <CreateListingButton currentUser={currentUser} />
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
