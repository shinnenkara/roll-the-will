"use client";

import type React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RetroButtonProps {
  tooltip: React.ReactNode;
  children: React.ReactNode;
}

export function RetroTooltip({ tooltip, children }: RetroButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="border-2 rounded-none border-foreground bg-background text-foreground shadow-retro p-2 text-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
