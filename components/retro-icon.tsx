"use client";

import type React from "react";
import { Button } from "@/components/ui/button";

export function RetroIcon({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={"pixel-icon"}
      variant={"ghost"}
      disabled={true}
      size={"icon-sm"}
    >
      {children}
    </Button>
  );
}
