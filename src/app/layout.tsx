import "./globals.css";
import type { Metadata } from "next";
import AuthProvider from "@/components/providers/AuthProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { Analytics } from "@segment/analytics-node";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Green Tractor",
  description: "The marketplace for Farmers.",
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  const analytics = new Analytics({
    writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!,
  });

  const headersList = headers();

  // If the user is logged in, we want to send their userId to Segment.
  // If they are not logged in, we want to send an anonymousId to Segment.
  const params = currentUser
    ? {
        userId: currentUser?.id,
      }
    : {
        anonymousId: randomUUID(),
      };

  // Open Question: Do we need to send this every time?
  analytics.identify({
    ...params,
    context: {
      traits: {
        name: currentUser?.name,
        email: currentUser?.email,
        description: currentUser?.profile,
        avatar: currentUser?.image,
        address: {
          city: currentUser?.city!,
          country: "US",
          postalCode: currentUser?.postalCode!,
          state: currentUser?.region!,
          street: currentUser?.addressLine1!,
        },
      },
    },
  });

  analytics.page({
    ...params,
    name: "allPageViews",
    context: {
      page: {
        path: headersList.get("x-invoke-path") ?? "",
        referrer: headersList.get("referer") ?? "",
        search: headersList.get("x-invoke-query") ?? "",
        title: "Green Tractor",
        url: `${headersList.get("x-forwarded-proto")}://${headersList.get(
          "host"
        )}${headersList.get("x-invoke-path")}`,
      },
      referrer: {
        url: headersList.get("referer") ?? "",
      },
      userAgent: headersList.get("user-agent") ?? "",
    },
  });

  // TODO: Unclear if the flush is needed.
  // Removing for now to improve performance.
  // await analytics.closeAndFlush();

  return (
    <AuthProvider>
      <AnalyticsProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={inter.className}>
            <main>{children}</main>
            <Toaster />
          </body>
        </html>
      </AnalyticsProvider>
    </AuthProvider>
  );
}
