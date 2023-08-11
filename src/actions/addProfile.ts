"use server";
import { prisma } from "@/lib/prisma";
import { type Profile } from "../schemas/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export default async function updateProfile({
  name,
  profile,
  address,
}: Profile) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }

  const currentUserEmail = session.user?.email!;

  await prisma.user.update({
    where: {
      email: currentUserEmail,
    },
    data: {
      name,
      profile,
      addressLine1: address.line1,
      addressLine2: address.line2,
      region: address.region,
      city: address.city,
      postalCode: address.postalCode,
      latitude: address.coordinates.lat,
      longitude: address.coordinates.lng,
    },
  });
  revalidatePath("/profile");
}
