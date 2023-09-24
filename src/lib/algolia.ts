import Algolia from "algoliasearch";
import { PrismaClient } from "@prisma/client";

export async function indexEverything() {
  const algolia = Algolia(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
    process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!
  );
  // We don't use the superclient, because that doesn't work in ts-node
  const prisma = new PrismaClient();
  const allListings = await prisma.listing.findMany({
    include: {
      listingUser: true,
      mainImage: true,
    },
  });

  console.log(allListings);

  const index = algolia.initIndex("listings_index");

  const records = allListings.map((listing) => ({
    objectID: listing.id,
    ...listing,
  }));
  try {
    await index.saveObjects([...records]);
    console.log("Successfully indexed all listings");
  } catch (err) {
    console.error(err);
  }

  index.setSettings({
    attributesToHighlight: ["title", "description"],
    attributesToSnippet: ["description:20"],
    indexLanguages: ["en"],
  });
  console.log("Successfully set settings");
}

indexEverything();
