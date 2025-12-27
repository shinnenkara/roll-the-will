"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function RetroInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        "rounded-none border-2 border-foreground bg-background px-3 py-2 shadow-none transition-none",
        "focus-visible:ring-0 focus-visible:shadow-retro-input focus-visible:border-foreground",
        className,
      )}
      {...props}
    />
  );
}
