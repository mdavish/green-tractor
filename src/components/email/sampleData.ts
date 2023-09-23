import { User } from "@prisma/client";
import { ExpandedOffer, ExpandedOfferUpdate } from "@/lib/prisma";

export const sampleUser: User = {
  addressLine1: "123 Main St",
  addressLine2: "",
  city: "Columbus",
  email: "davish9@gmail.com",
  emailVerified: new Date(),
  id: "ckqj1qj5h0000qj1qj5h0000q",
  image: "https://avatars.githubusercontent.com/u/26788408?v=4",
  name: "Davis Herring",
  latitude: 39.9612,
  longitude: -82.9988,
  postalCode: "12345",
  profile: "He's a guy!",
  region: "OH",
  stripeAccountId: "acct_1IY2Zz2ZQjYQXZ0S",
  stripeCustomerId: "cus_J3V8KQXq8q9Zk7",
  stripeAccountLink: "https://connect.stripe.com/setup/s/acc_1IY2Zz2ZQjYQXZ0S",
};

export const sampleOffer: ExpandedOffer = {
  id: "ckqj1qj5h0000qj1qj5h0000q",
  listingId: "ckqj1qj5h0000qj1qj5h0000q",
  offerDate: new Date(),
  offerMessage: "I would like to buy your tractor!",
  offerPrice: 10000,
  offerPriceCurrency: "USD",
  seen: false,
  status: "OPEN",
  offerUserId: "ckqj1qj5h0000qj1qj5h0000q",
  offerUser: sampleUser,
  listing: {
    id: "ckqj1qj5h0000qj1qj5h0000q",
    title: "John Deere 1025R",
    description: "This is a great tractor!",
    expirationDate: new Date(),
    mainImageId: null,
    startingPrice: 10000,
    listedDate: new Date(),
    listingUser: sampleUser,
    listingUserId: "ckqj1qj5h0000qj1qj5h0000q",
    startingPriceCurrency: "USD",
    status: "OPEN",
  },
};

export const sampleOfferUpdate: ExpandedOfferUpdate = {
  actorUser: sampleUser,
  actorUserId: "ckqj1qj5h0000qj1qj5h0000q",
  id: "ckqj1qj5h0000qj1qj5h0000q",
  message: "I am paying for your listing.",
  newPrice: 10000,
  newStatus: "PAID",
  offer: sampleOffer,
  offerId: "ckqj1qj5h0000qj1qj5h0000q",
  seen: false,
  updatedAt: new Date(),
  stripeSessionDetails: {},
  stripeSessionId: "ckqj1qj5h0000qj1qj5h0000q",
};
