import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

interface EmailTemplateProps {
  headline: string;
  subheader?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const EmailTemplate = ({
  headline,
  subheader,
  children,
  className,
}: EmailTemplateProps) => (
  <div className={cn("w-full h-full flex", className)}>
    <div className="mx-auto my-auto w-full h-3/4 max-w-3xl border border-slate-200 rounded-md p-4 flex flex-col gap-y-5">
      <Logo />
      <h1 className="text-2xl font-medium">{headline}</h1>
      <p className="text-base text-slate-900">{subheader}</p>
      {children}
      <div className="border-t pt-3 border-slate-200 text-slate-700 text-sm flex flex-col gap-y-2">
        <p>Green Tractor</p>
        <p>205 President Street</p>
        <p>Brooklyn, NY, 11231</p>
      </div>
    </div>
  </div>
);
