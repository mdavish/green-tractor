"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Patua_One } from "next/font/google";
import tractorDominant from "../../public/tractor_dominant.jpg";

const patuaOne = Patua_One({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-y-6">
      <nav className="bg-green-700 w-full flex items-center justify-between py-3 px-4">
        <h1 className={cn("text-white text-xl font-bold", patuaOne.className)}>
          Green Tractor
        </h1>
        <Button
          variant={"secondary"}
          className="w-fit ml-auto"
          onClick={() => signIn()}
        >
          Sign In
        </Button>
      </nav>
      <div className="flex flex-col gap-y-4">
        <div className="relative">
          <div className="h-full flex flex-col absolute -bottom-20 md:-right-14 text-white w-fit md:max-w-md md:w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.5 },
              }}
              className="w-fit md:w-full flex flex-col gap-y-4 border p-4 rounded-xl shadow-lg border-gray-200 bg-green-700 my-auto text-center"
            >
              <h1
                className={cn(
                  "text-white text-4xl md:text-7xl font-bold",
                  patuaOne.className
                )}
              >
                Green <br /> Tractor
              </h1>
              <p className="text-sm md:text-base w-3/4 mx-auto">
                Green Tractor makes it easy to buy and sell farm equipment,
                seeds, and more.
              </p>
              <Button
                variant={"secondary"}
                className="w-fit mx-auto"
                onClick={() => signIn()}
              >
                Get Started
              </Button>
            </motion.div>
          </div>
          <Image
            className="w-full max-w-4xl rounded-xl"
            src={tractorDominant}
            alt="Tractor"
          />
        </div>
      </div>
    </main>
  );
}
