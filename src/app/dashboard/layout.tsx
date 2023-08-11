import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  if (!session) {
    throw new Error("No session found. This should never happen.");
  }

  return (
    <div className={cn("h-screen w-full flex md:flex-row flex-col-reverse")}>
      <Navigation className="mt-auto" />
      <div className="w-full h-full overflow-y-auto">{children}</div>
    </div>
  );
}
