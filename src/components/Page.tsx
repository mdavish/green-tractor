"use client";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./ui/button";

export default function Page({
  children,
  className,
  title,
  buttons,
  maxWidth = true,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  buttons?: {
    text: string;
    onClick: () => void;
    variant: ButtonProps["variant"];
  }[];
  maxWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col p-6 md:px-10 md:py-6 w-full",
        maxWidth ? "max-w-4xl" : "max-w-none",
        className
      )}
    >
      {title && (
        <div className="w-full flex flex-row">
          <h1 className="text-3xl font-medium text-slate-800 mb-8">{title}</h1>
          {buttons && (
            <div className="ml-auto flex flex-row gap-x-2">
              {/* This doesn't play nicely with server components */}
              {/* TODO: Figure out how to make this work better */}
              {buttons.map(({ text, onClick, variant }) => (
                <Button key={text} variant={variant} onClick={onClick}>
                  {text}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
