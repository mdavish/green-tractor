import { ProfileForm } from "./ProfileForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Page from "@/components/Page";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }
  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email!,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return (
    <Page title="My Profile">
      <ProfileForm name={user.name!} profile={user.profile!} />
    </Page>
  );
}
