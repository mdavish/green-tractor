import z from "zod";
import { AddressSchema } from "./Address";

export const ProfileSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  profile: z.string(),
  address: AddressSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;
