import type { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FarmerPreviewProps = User & {
  className?: string;
};

export default function FarmerPreview({
  id,
  image,
  name,
  region,
  city,
  className,
}: FarmerPreviewProps) {
  return (
    <div key={id} className={cn("flex flex-row", className)}>
      {/* TODO: Figure out why Google images 403 sometimes. */}
      <Avatar className="mr-3 my-auto">
        <AvatarImage src={image!} />
        <AvatarFallback>{name?.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-y-1 my-auto">
        <Link className="hover:underline" href={`/farmers/${id}`}>
          <h1 className="font-medium text-slate-900">{name}</h1>
        </Link>
        <h2 className="text-sm font-normal text-slate-700">
          {region ? (
            <span>{`${city}, ${region}`}</span>
          ) : (
            <span className="italic text-xs text-slate-500">No Location</span>
          )}
        </h2>
      </div>
    </div>
  );
}
