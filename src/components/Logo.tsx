import Image from "next/image";
import logoGreen from "../../public/logoGreen.png";
import { Patua_One } from "next/font/google";
import { cn } from "@/lib/utils";

const patuaOne = Patua_One({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

export default function EmailLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-row gap-x-3 p-1", className)}>
      <Image
        className="my-auto"
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
    </div>
  );
}
