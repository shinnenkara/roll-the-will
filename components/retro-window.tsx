"use client";

import type React from "react";

import { X } from "lucide-react";
import { RetroButtonIcon } from "@/components/retro-button-icon";
import { RetroTooltip } from "@/components/retro-tooltip";

interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function RetroWindow({
  title,
  children,
  onClose,
  className = "",
}: RetroWindowProps) {
  return (
    <div
      className={`border-2 border-foreground bg-background shadow-retro ${className}`}
    >
      <div className="border-b-2 border-foreground p-1 flex items-center justify-between radial-background">
        <span className="font-bold text-foreground bg-background px-2">
          {title}
        </span>
        {onClose && (
          <RetroTooltip tooltip={"Close Window"}>
            <RetroButtonIcon onClick={onClose}>
              <X strokeWidth={3} />
            </RetroButtonIcon>
          </RetroTooltip>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
