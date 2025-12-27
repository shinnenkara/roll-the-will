"use client";

import type React from "react";
import { Button } from "@/components/ui/button";

export function RetroButtonIcon({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={
        "pixel-icon bg-background border-2 rounded-none border-foreground hover:bg-foreground hover:text-background"
      }
      variant={"secondary"}
      size={"icon-sm"}
    >
      {children}
    </Button>
  );
}
