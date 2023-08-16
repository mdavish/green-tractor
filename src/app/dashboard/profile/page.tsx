import { ProfileForm } from "./ProfileForm";
import Page from "@/components/Page";
import { StateSchema, type State } from "@/schemas/State";
import SectionHeader from "@/components/SectionHeader";
import StripeEmptyState from "@/components/StripeEmptyState";
import { getCurrentUser } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FaCheckCircle } from "react-icons/fa";
import stripeClient from "@/lib/stripe";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User not found");
  }

  // TODO: Show this in the UI.
  let payoutsEnabled = false;
  if (user.stripeAccountId) {
    const accountDetails = await stripeClient.accounts.retrieve(
      user.stripeAccountId
    );
    payoutsEnabled = accountDetails.payouts_enabled;
  }

  let region: State | undefined;
  const parsedState = StateSchema.safeParse(user.region);
  if (parsedState.success) {
    region = parsedState.data;
  }

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
        {/* TODO: Handle the case where Stripe account exists but payouts not enabled. */}
        {payoutsEnabled ? (
          // TODO: Add additional information/details.
          <Alert>
            <FaCheckCircle className="text-primary mr-2 h-4 w-4" />
            <AlertTitle>You&lsquo;re all set.</AlertTitle>
            <AlertDescription>
              Your business information has been verified and you can now accept
              payments.
            </AlertDescription>
          </Alert>
        ) : (
          <StripeEmptyState />
        )}
      </div>
    </Page>
  );
}
