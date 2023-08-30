// Modeled off of the greatest pill of all time:
// https://twitter.com/steveschoger/status/1694741661551677700
import { cn } from "@/lib/utils";

export type PillColors = "green" | "red" | "slate";

interface PillProps {
  text: string;
  color?: PillColors;
  className?: string;
  chromeless?: boolean;
}

export default function Pill({
  text,
  color = "green",
  className,
  chromeless = false,
}: PillProps) {
  const colors = {
    green: "bg-primary/20 text-primary",
    red: "bg-red-100 text-red-800",
    slate: "bg-slate-100 text-slate-800",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium w-fit",
        colors[color],
        !chromeless && "border border-transparent",
        !chromeless && "hover:border-slate-200",
        className
      )}
    >
      {text}
    </div>
  );
}
