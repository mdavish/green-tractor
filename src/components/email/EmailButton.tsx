import { Button } from "@react-email/components";
import cn from "./emailCn";

export default function EmailButton({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <Button
      pX={20}
      pY={10}
      href={href}
      className={cn(
        "bg-primary rounded text-white font-semibold no-underline text-center",
        className
      )}
    >
      {children}
    </Button>
  );
}
