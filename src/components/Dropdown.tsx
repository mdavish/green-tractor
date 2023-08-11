"use client";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "./ui/scroll-area";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string; // Value is just the value of the option, not the label
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  emptyMessage?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder,
  label,
  emptyMessage,
}: DropdownProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            <ScrollArea>
              {options.map((option) => (
                <CommandItem
                  value={option.label}
                  key={option.value}
                  onSelect={() => {
                    onChange?.(option.value);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
