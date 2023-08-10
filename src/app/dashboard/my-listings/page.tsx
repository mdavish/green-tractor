import Page from "@/components/Page";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function aMyListingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");
  const listings = await prisma.listing.findMany({
    where: {
      listingUserId: currentUser.id,
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
            <div
              key={listing.id}
              className=" border border-slate-300 shadow-sm p-4 rounded-md w-full flex flex-row"
            >
              <div className="flex flex-col gap-y-2">
                <Link href={`/dashboard/listings/${listing.id}`}>
                  <h1 className="hover:underline font-medium">
                    {listing.title}
                  </h1>
                </Link>
                <p className="tracking-tight text-sm text-slate-700">
                  {listing.description}
                </p>
                <div className="mt-2 flex flex-row text-xs text-slate-500 gap-x-4">
                  <p>
                    Posted {new Date(listing.listedDate).toLocaleDateString()}
                  </p>
                  <p>
                    Expires{" "}
                    {new Date(listing.expirationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="ml-auto mr-4 my-auto">
                <h2 className="text-3xl font-medium text-center">
                  ${listing.startingPrice}
                </h2>
                <p className="mt-2 text-xs text-gray-600">Starting Price</p>
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
