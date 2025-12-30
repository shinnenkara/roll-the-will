"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RetroButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={cn(
        "bg-background border-2 rounded-none border-foreground hover:bg-foreground hover:text-background shadow-retro transition-all active:translate-x-1 active:translate-y-1 active:shadow-none",
        className,
      )}
      variant={"secondary"}
    >
      {children}
    </Button>
  );
}
