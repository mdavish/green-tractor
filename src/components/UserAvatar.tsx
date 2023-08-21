"use server";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { prisma } from "@/lib/prisma";

export default async function UserAvatar({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return (
    <Avatar className={className}>
      <AvatarImage src={user?.image!} />
      <AvatarFallback />
    </Avatar>
  );
}
