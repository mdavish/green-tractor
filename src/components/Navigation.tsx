"use client";
import { cn } from "@/lib/utils";
import UserBadge from "@/components/UserBadge";
import Link from "next/link";
import { FaHome, FaUserEdit, FaMoneyBillWave } from "react-icons/fa";
import { usePathname } from "next/navigation";

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
    name: "My Listings",
    href: "/dashboard/my-listings",
    icon: <FaMoneyBillWave />,
  },
  {
    name: "My Profile",
    href: "/dashboard/profile",
    icon: <FaUserEdit />,
  },
];

export default function Navigation({}: {}) {
  const pathname = usePathname();
  return (
    <nav className="w-72 h-full flex flex-col border-r border-slate-100 p-4">
      <div className="mt-10 flex flex-col gap-y-4">
        {navItems.map((item) => {
          const active = pathname.endsWith(item.href);
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
  );
}
