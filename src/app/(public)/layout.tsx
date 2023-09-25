"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Patua_One } from "next/font/google";
import logoGreen from "../../../public/logoGreen.png";
import { InstantSearch } from "react-instantsearch";
import { algoliaClient } from "@/lib/algolia";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SearchBar from "@/components/SearchBar";

const patuaOne = Patua_One({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <InstantSearch searchClient={algoliaClient} indexName="listings_index">
        <nav className="bg-white border-b border-slate-200 w-full flex flex-row gap-x-2 items-center justify-between py-3 px-10 sticky top-0 z-50">
          <Link href="/" className="flex flex-row w-fit shrink-0">
            <Image
              className="my-auto mr-3 shrink-0"
              src={logoGreen}
              alt="Green Tractor Logo"
              width={40}
              height={40}
            />
            <h1
              className={cn(
                "hidden md:block text-primary text-xl font-bold select-none",
                patuaOne.className
              )}
            >
              Green Tractor
            </h1>
          </Link>
          <SearchBar
            placeholder="Search..."
            className="md:shrink-0 md:basis-2/5"
          />
          <Button className="w-fit whitespace-nowrap " onClick={() => signIn()}>
            Sign In
          </Button>
        </nav>
      </InstantSearch>
      {children}
    </main>
  );
}
