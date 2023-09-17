import { EmailTemplate } from "@/components/email/EmailTemplate";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: "max@greentractor.us",
      subject: "Hello, World!",
      to: "max@greentractor.us",
      react: EmailTemplate({ firstName: "Christian" }) as React.ReactElement,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
