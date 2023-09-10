"use server";
import type { OfferUpdate, User } from "@prisma/client";

export type OfferUpdateReturn =
  | {
      status: "error";
      error: string;
    }
  | ({
      status: "success";
    } & OfferUpdate & {
        actorUser: User;
        offer: {
          listing: {
            listingUser: User;
          };
          offerUser: User;
        };
      });
