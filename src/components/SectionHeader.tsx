import { cn } from "@/lib/utils";

const SectionHeader = ({
  header,
  subheader,
  size = "sm",
  className,
  showBorder = true,
}: {
  header: string;
  subheader: string;
  size?: "sm" | "lg";
  className?: string;
  showBorder?: boolean;
}) => {
  return (
    <div className={cn("flex flex-col gap-y-1 my-2 max-w-4xl", className)}>
      <div className="flex flex-row">
        <h3
          className={cn(
            "font-medium text-slate-800",
            size === "lg" && "text-xl"
          )}
        >
          {header}
        </h3>
        {size === "sm" && showBorder && (
          <div className="ml-2 flex-grow border-t border-slate-200 my-auto" />
        )}
      </div>
      <p className={cn("text-xs text-slate-600", size === "lg" && "text-sm")}>
        {subheader}
      </p>
    </div>
  );
};

export default SectionHeader;
