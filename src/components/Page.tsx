import { cn } from "@/lib/utils";

export default function Page({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={cn("flex flex-col pt-10 px-10 w-full", className)}>
      {title && (
        <h1 className="text-3xl font-medium text-slate-800 mb-8">{title}</h1>
      )}
      {children}
    </div>
  );
}
