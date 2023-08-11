import z from "zod";
import { StateSchema } from "./State";

export const AddressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  region: StateSchema,
  city: z.string(),
  postalCode: z.string(),
  coordinates: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
});

export type Address = z.infer<typeof AddressSchema>;
