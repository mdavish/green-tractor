import z from "zod";
import { CloudinaryUploadResponseSchema } from "@/lib/cloudinary";

export const ListingSchema = z.object({
  title: z.string(),
  description: z.string(),
  startingPrice: z.coerce.number().positive(),
  listedDate: z.date(),
  expirationDate: z.date(),
  imageDetails: CloudinaryUploadResponseSchema.optional(),
});

export type ListingData = z.infer<typeof ListingSchema>;
