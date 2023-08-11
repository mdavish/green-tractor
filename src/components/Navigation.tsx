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
  onMobile?: boolean;
}

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/dashboard",
    icon: <FaHome />,
    onMobile: true,
  },
  {
    name: "My Listings",
    href: "/dashboard/my-listings",
    icon: <FaMoneyBillWave />,
    onMobile: true,
  },
  {
    name: "My Profile",
    href: "/dashboard/profile",
    icon: <FaUserEdit />,
    onMobile: true,
  },
];

export default function Navigation({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav className="md:w-72 h-fit md:h-full md:flex flex-col bg-slate-100 border-t border-slate-200 md:bg-white md:border-r md:border-slate-100 p-4">
      <div className="md:mt-10 flex flex-row md:flex-col gap-y-4">
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
              <div className="md:mx-0 w-full md:w-fit my-auto text-lg flex">
                <span className="mx-auto md:mx-0">{item.icon}</span>
              </div>
              <h2 className="hidden md:block">{item.name}</h2>
            </Link>
          );
        })}
      </div>
      <div className="hidden md:block mt-auto">
        <UserBadge />
      </div>
    </nav>
  );
}
