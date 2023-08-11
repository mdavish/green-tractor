import { ProfileForm } from "./ProfileForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Page from "@/components/Page";
import { StateSchema, type State } from "@/schemas/State";

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

  let region: State | undefined;
  const parsedState = StateSchema.safeParse(user.region);
  if (parsedState.success) {
    region = parsedState.data;
  }

  return (
    <Page title="My Profile">
      <ProfileForm
        name={user.name!}
        profile={user.profile!}
        email={user.email!}
        address={{
          city: user.city!,
          line1: user.addressLine1!,
          postalCode: user.postalCode!,
          region: region,
          coordinates: {
            lat: user.latitude!,
            lng: user.longitude!,
          },
        }}
      />
    </Page>
  );
}
