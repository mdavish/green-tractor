import Algolia from "algoliasearch";
import { PrismaClient } from "@prisma/client";

export const algoliaClient = Algolia(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!
);

export const listingsIndex = algoliaClient.initIndex("listings_index");

listingsIndex.setSettings({
  attributesToHighlight: ["title", "description"],
  attributesToSnippet: ["description:20"],
  indexLanguages: ["en"],
});

export async function indexEverything() {
  // We don't use the superclient, because that doesn't work in ts-node
  const prisma = new PrismaClient();
  const allListings = await prisma.listing.findMany({
    include: {
      listingUser: true,
      mainImage: true,
    },
  });

  console.log(allListings);

  const records = allListings.map((listing) => ({
    objectID: listing.id,
    ...listing,
  }));
  await listingsIndex.saveObjects([...records]);
}

if (require.main === module) {
  // We only clear everything when we run this directly
  listingsIndex.clearObjects();
  indexEverything();
}
