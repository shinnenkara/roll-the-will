"use client";

import type React from "react";
import { Button } from "@/components/ui/button";

export function RetroButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  // TODO: pretty effect on click - maybe depth - maybe slight xy transition - maybe both
  return (
    <Button
      {...props}
      className={
        "bg-background border-2 rounded-none border-foreground hover:bg-foreground hover:text-background shadow-retro"
      }
      variant={"secondary"}
    >
      {children}
    </Button>
  );
}
