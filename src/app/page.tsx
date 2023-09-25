"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Patua_One } from "next/font/google";
import { FaArrowRight } from "react-icons/fa";
import tractorDominant from "../../public/tractor_dominant.jpg";
import farmerDominant from "../../public/farmerDominant.jpg";
import logoGreen from "../../public/logoGreen.png";
import SearchBar from "@/components/SearchBar";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch } from "react-instantsearch";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!
);

const patuaOne = Patua_One({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <InstantSearch searchClient={searchClient} indexName="listings_index">
      <main className="flex min-h-screen flex-col items-center gap-y-6">
        <nav className="bg-white border-b border-slate-200 w-full flex items-center justify-between py-3 px-4">
          <Image
            className="my-auto mr-4"
            src={logoGreen}
            alt="Green Tractor Logo"
            width={40}
            height={40}
          />
          <h1
            className={cn(
              "text-primary text-xl font-bold select-none",
              patuaOne.className
            )}
          >
            Green Tractor
          </h1>
          <Button className="w-fit ml-auto" onClick={() => signIn()}>
            Sign In
          </Button>
        </nav>
        <div className="w-full flex flex-col md:flex-row justify-center gap-y-8 gap-x-10 h-[90vh] md:h-[60vh] px-10">
          <div className="w-full md:basis-2/3 h-full rounded-xl relative">
            <Image
              className="rounded-xl absolute "
              src={tractorDominant}
              alt="Tractor"
              fill={true}
            />
            <div className="absolute z-10 bg-black/60 h-full w-full flex rounded-xl"></div>
            <div className="absolute z-20 h-full w-full flex rounded-xl">
              <div className="mx-auto my-auto p-6 flex max-w-3xl">
                <div className="flex flex-row gap-x-4">
                  <div className="hidden md:flex w-fit h-fit shrink-0 aspect-square rounded-full bg-white p-3">
                    <Image
                      className="mx-auto my-auto"
                      src={logoGreen}
                      alt="Green Tractor Logo"
                      width={50}
                      height={50}
                    />
                  </div>
                  <div className="text-center md:text-left flex flex-col gap-y-5 text-white">
                    <h1
                      className={cn(
                        "text-white my-auto text-4xl md:text-5xl font-bold",
                        patuaOne.className
                      )}
                    >
                      The easiest way to buy and sell used farm equipment.
                    </h1>
                    <SearchBar />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:basis-1/3 h-full rounded-xl overflow-hidden relative">
            <Image
              className="w-full max-w-xl rounded-xl"
              src={farmerDominant}
              alt="Farmer"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute z-10 bg-black/60 h-full w-full flex">
              <div className="max-w-xl mx-auto my-auto text-center flex flex-col gap-y-6">
                <h1
                  className={cn(
                    "text-white my-auto text-4xl md:text-5xl font-bold",
                    patuaOne.className
                  )}
                >
                  Ready to start selling?
                </h1>
                <Button
                  className="w-fit mx-auto group"
                  onClick={() => signIn()}
                >
                  Get Started Today
                  <FaArrowRight className="inline ml-2 group-hover:translate-x-1 transition-all" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </InstantSearch>
  );
}
