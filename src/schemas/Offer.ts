import { z } from "zod";

export const OfferSchema = z.object({
  message: z.string(),
  price: z.number().positive({
    message: "Price must be positive",
  }),
});

export type Offer = z.infer<typeof OfferSchema>;
