"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Patua_One } from "next/font/google";
import { FaArrowRight } from "react-icons/fa";
import tractorDominant from "../../public/tractor_dominant.jpg";
import logoGreen from "../../public/logoGreen.png";

const patuaOne = Patua_One({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

export default function Home() {
  return (
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
      <div className="flex flex-col gap-y-4">
        <div className="relative">
          <div className="h-full flex flex-col absolute md:-right-14 text-white w-fit md:max-w-md md:w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.5 },
              }}
              className="w-fit md:w-full flex flex-col gap-y-4 border p-4 rounded-xl shadow-lg border-slate-300 bg-white text-center my-auto"
            >
              <Image
                className="mx-auto"
                src={logoGreen}
                alt="Green Tractor Logo"
                width={175}
                height={175}
              />
              <h1
                className={cn(
                  "text-primary text-4xl md:text-5xl font-bold",
                  patuaOne.className
                )}
              >
                Green Tractor
              </h1>
              <p className="text-sm md:text-base w-3/4 mx-auto text-slate-900">
                Green Tractor makes it easy to buy and sell farm equipment,
                seeds, and more.
              </p>
              <div className="flex flex-row gap-x-2 mx-auto">
                <Button className="w-fit" onClick={() => signIn()}>
                  Get Started
                </Button>
                <Button
                  variant={"secondary"}
                  className="w-fit group"
                  onClick={() => signIn()}
                >
                  Learn More{" "}
                  <FaArrowRight className="ml-1 group-hover:translate-x-1 transition-all ease-in-out duration-200" />
                </Button>
              </div>
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
