import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions, getCurrentUserStrict } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import getNotifications from "@/lib/db/getNotifications";
import NotificationsProvider from "@/components/providers/NotificationsProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const currentUser = await getCurrentUserStrict();
  const notifications = await getNotifications();

  if (!session) {
    throw new Error("No session found. This should never happen.");
  }

  return (
    <NotificationsProvider
      currentUser={currentUser}
      initialNotifications={notifications}
    >
      <div
        className={cn("h-[100dvh] w-full flex md:flex-row flex-col-reverse")}
      >
        <Navigation className="mt-auto" />
        <div className="w-full h-full overflow-y-auto">{children}</div>
      </div>
    </NotificationsProvider>
  );
}
