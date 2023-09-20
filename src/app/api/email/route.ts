// This route exists to test the email templates.
// I'm not aware of a better way to do this.
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import OfferEmail from "@/components/email/OfferEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const offer = await prisma.offer.findFirst({
      include: {
        offerUser: true,
        listing: {
          include: {
            listingUser: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "No offers found" });
    }

    const data = await resend.emails.send({
      from: "max@greentractor.us",
      subject: "Hello, World!",
      to: "max@greentractor.us",
      react: OfferEmail({
        offer,
      }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
