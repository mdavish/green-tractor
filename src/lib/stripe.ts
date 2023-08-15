import stripe from "stripe";

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
  typescript: true,
});

export default stripeClient;
