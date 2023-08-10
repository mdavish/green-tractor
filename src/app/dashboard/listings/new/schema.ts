import z from "zod";

export const ListingSchema = z.object({
  title: z.string(),
  description: z.string(),
  startingPrice: z.coerce.number().positive(),
  listedDate: z.date(),
  expirationDate: z.date(),
  imageUrl: z.string().optional(),
});

export type ListingData = z.infer<typeof ListingSchema>;
