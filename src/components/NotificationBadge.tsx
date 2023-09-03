import { cn } from "@/lib/utils";
import { FaExclamation } from "react-icons/fa";

export default function NotificationBadge({
  n,
  className,
}: {
  n: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-red-600 text-white rounded-full w-5 h-5 flex justify-center items-center text-xs",
        className
      )}
    >
      {n ?? <FaExclamation />}
    </div>
  );
}
