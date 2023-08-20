import { z } from "zod";

export const OfferFormSchema = z.object({
  offerMessage: z.string(),
  offerPrice: z.number().positive({
    message: "Price must be positive",
  }),
});

export type OfferFormData = z.infer<typeof OfferFormSchema>;
