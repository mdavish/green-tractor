import z from "zod";

export const ProfileFormSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  profile: z.string(),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;