"use server"
import { prisma } from "@/lib/prisma";
import { type ProfileFormValues } from "./schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { revalidatePath } from "next/cache";

export default async function updateProfile({name, profile}: ProfileFormValues) {
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
    }
  });
  revalidatePath("/profile");
}