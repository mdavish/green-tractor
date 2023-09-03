"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function joinWaitlist({ email }: { email: string }) {
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: [email, "davish9@gmail.com", "ferzola43@gmail.com"],
    subject: "Welcome to the Green Tractor Waitlist!",
    html: "Welcome to the Green Tractor Waitlist! We will be in touch soon.",
  });
}
