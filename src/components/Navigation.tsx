"use client";
import { cn } from "@/lib/utils";
import UserBadge from "@/components/UserBadge";
import Link from "next/link";
import { FaHome, FaUserEdit, FaMoneyBillWave, FaInbox } from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "./ui/button";
import Logo from "./Logo";
import { useNotifications } from "./providers/NotificationsProvider";
import NotificationBadge from "./NotificationBadge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  onMobile?: boolean;
  unreadNotifications?: number;
}

export default function Navigation({ className }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { notifications } = useNotifications();

  const navItems: NavItem[] = [
    {
      name: "Home",
      href: "/dashboard",
      icon: <FaHome />,
      onMobile: true,
    },
    {
      name: "Inbox",
      href: "/dashboard/inbox",
      icon: <FaInbox />,
      onMobile: true,
      unreadNotifications: notifications.totalUnreads,
    },
    {
      name: "My Listings",
      href: "/dashboard/my-listings",
      icon: <FaMoneyBillWave />,
      onMobile: true,
    },
    {
      name: "Farmers",
      href: "/dashboard/farmers",
      icon: <GiFarmer />,
      onMobile: false,
    },
    {
      name: "My Profile",
      href: "/dashboard/profile",
      icon: <FaUserEdit />,
      onMobile: true,
    },
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandGroup heading="Suggestions">
            {navItems.map((item) => {
              return (
                <CommandItem
                  onSelect={() => {
                    router.push(item.href);
                    setOpen(false);
                  }}
                  key={item.name}
                  className="text-slate-700 flex flex-row"
                >
                  <span className="mr-4 h-4 w-4 my-auto text-slate">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <nav className="md:w-72 h-fit md:h-full md:flex flex-col bg-slate-100 border-t border-slate-200 md:bg-white md:border-r md:border-slate-100 p-2 md:p-4">
        <Logo className="hidden md:flex mb-4 mt-2" />
        <Button
          onClick={() => setOpen(true)}
          className="hidden md:flex flex-row group text-slate-500 hover:text-slate-700 transition-all ease-in-out duration-300 shadow-sm hover:shadow-md"
          variant={"outline"}
        >
          <div className="mr-auto">Search...</div>{" "}
          <div className="m1l-auto text-slate-500 text-xs my-auto border border-slate-200 group-hover:borer-slate-300 rounded-md px-1 py-0.5">
            ⌘K
          </div>
        </Button>
        <div className="md:mt-6 flex flex-row md:flex-col gap-y-4">
          {navItems.map((item) => {
            // A path name is active if contains the href
            // Except for the home page, which is active if the path name is exactly the href
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.includes(item.href));
            return (
              <Link
                key={item.name}
                className={cn(
                  "text-slate-800 text-base font- hover:text-slate-700 hover:bg-slate-100 rounded-xl w-full p-2 flex flex-row gap-x-4",
                  active && "bg-slate-100",
                  !item.onMobile && "hidden md:flex"
                )}
                href={item.href}
              >
                <div className="md:mx-0 w-full md:w-fit my-auto text-lg flex">
                  <span className="mx-auto md:mx-0">{item.icon}</span>
                </div>
                <h2 className="hidden md:block">{item.name}</h2>
                {item.unreadNotifications !== undefined &&
                  item.unreadNotifications > 0 && (
                    <NotificationBadge
                      n={notifications.totalUnreads}
                      className="hidden md:flex my-auto ml-auto mr-1"
                    />
                  )}
              </Link>
            );
          })}
        </div>
        <div className="hidden md:block mt-auto">
          <UserBadge />
        </div>
      </nav>
    </>
  );
}
