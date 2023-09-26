import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DefaultSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { BiMenu } from "react-icons/bi";
import type { NavItem } from "./Navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

const menuItems: Omit<NavItem, "icon">[] = [
  {
    name: "Home",
    href: "/dashboard",
    onMobile: true,
  },
  {
    name: "Inbox",
    href: "/dashboard/inbox",
    onMobile: true,
  },
  {
    name: "My Listings",
    href: "/dashboard/my-listings",
    onMobile: true,
  },
  {
    name: "Farmers",
    href: "/dashboard/farmers",
    onMobile: false,
  },
  {
    name: "My Profile",
    href: "/dashboard/profile",
    onMobile: true,
  },
];

export default function DashboardDropdownMenu({
  session,
}: {
  session: DefaultSession;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          className="py-2 pl-3 pr-1 rounded-full flex flex-row"
        >
          <BiMenu size={20} />
          <Avatar className="h-8 w-8 ml-3 mr-0">
            <AvatarImage src={session.user?.image ?? undefined} />
            <AvatarFallback />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="text-slate-800 w-36 justify-left">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((item) => {
          return (
            <DropdownMenuItem key={item.name}>
              <Link href={item.href} className="text-slate-900 cursor-pointer">
                {item.name}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button
            className="text-slate-900 cursor-pointer"
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }
          >
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
