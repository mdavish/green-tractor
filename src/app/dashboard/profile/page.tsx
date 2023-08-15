import { ProfileForm } from "./ProfileForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Page from "@/components/Page";
import { StateSchema, type State } from "@/schemas/State";
import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import { FaBusinessTime } from "react-icons/fa";

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

  const handleStripeSetup = async () => {};

  return (
    <Page title="My Profile">
      <div className="w-full max-w-2xl flex flex-col gap-y-4">
        <SectionHeader
          header="Core Information"
          subheader="Basic information about you and your farm."
          size="sm"
        />
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
        <SectionHeader
          header="Business Information"
          subheader="Settings for managing payments to your business."
        />
        <EmptyState
          title="Set up your Business Account"
          subtitle="In order to receive payments from Green Tractor, you need to set up your business account."
          buttonText="Set Up Now"
          Icon={FaBusinessTime}
        />
      </div>
    </Page>
  );
}
