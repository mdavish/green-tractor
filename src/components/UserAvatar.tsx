import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import type { User } from "@prisma/client";

export default async function UserAvatar({
  user,
  className,
}: {
  user: User;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={user?.image!}
        // So that Google photos work
        referrerPolicy="no-referrer"
      />
      <AvatarFallback />
    </Avatar>
  );
}
