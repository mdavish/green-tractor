import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import UserBadge from "@/components/UserBadge";
import Link from "next/link";
import { FaHome, FaDraftingCompass } from "react-icons/fa";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/dashboard",
    icon: <FaHome />,
  },
  {
    name: "My Profile",
    href: "/dashboard/profile",
    icon: <FaDraftingCompass />,
  },
];

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

  const headersList = headers();
  const currentPath = headersList.get("x-invoke-path");

  return (
    <div className={cn("h-screen w-full flex flex-row")}>
      <nav className="w-72 h-full flex flex-col border-r border-slate-100 p-4">
        <div className="mt-10 flex flex-col gap-y-4">
          {navItems.map((item) => {
            // TODO: Turn navigation into a client component because this doesn't actually work
            const active = currentPath && currentPath.endsWith(item.href);
            return (
              <Link
                key={item.name}
                className={cn(
                  "text-slate-800 text-base font- hover:text-slate-700 hover:bg-slate-100 rounded-xl w-full p-2 flex flex-row gap-x-4",
                  active && "bg-slate-100"
                )}
                href={item.href}
              >
                <div className="my-auto text-lg">{item.icon}</div>
                <h2>{item.name}</h2>
              </Link>
            );
          })}
        </div>
        <div className="mt-auto">
          <UserBadge />
        </div>
      </nav>
      {children}
    </div>
  );
}
