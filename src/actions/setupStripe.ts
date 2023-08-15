import stripe from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function setupStripe() {
  // Every time a user signs in, we check if their Stripe account exists
  // If it doesn't, we create one and redirect them to the onboarding flow
  // If it does, they can sign in

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error(
      `User not found in the database. User must exist in DB before Stripe account can be created.`
    );
  }

  if (currentUser.stripeAccountId) {
    throw new Error(
      `User ${currentUser.id} already has a Stripe account. User must not have a Stripe account before Stripe account can be created.`
    );
  }

  const createdAccount = await stripe.accounts.create({
    type: "express",
    email: currentUser.email!,
    country: "US",
    default_currency: "USD",
    business_type: "individual",
    metadata: {
      userId: currentUser.id,
      name: currentUser.name!,
    },
  });

  console.log(`Created Stripe account for ${currentUser.email}`);

  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      stripeAccountId: createdAccount.id,
    },
  });

  console.log(`Updated user ${currentUser.email} with Stripe account ID`);

  const accountId = createdAccount.id;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    // TODO: Confirm this is the correct URL for reauth
    refresh_url: `${process.env.NEXTAUTH_URL}/reauth`,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  });

  console.log(`Created account link for ${currentUser.email}`);

  // Not sure if this actually needs to be saved
  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      stripeAccountLink: accountLink.url,
    },
  });

  console.log(`Updated user ${currentUser.email} with Stripe account link`);

  return accountLink.url;
}
