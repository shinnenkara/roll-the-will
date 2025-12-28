"use client";

import { JSX, ReactNode } from "react";

import { X } from "lucide-react";
import { RetroButtonIcon } from "@/components/retro-button-icon";
import { RetroTooltip } from "@/components/retro-tooltip";

interface RetroWindowProps {
  icon?: JSX.Element;
  title: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function RetroWindow({
  icon,
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
        <div className={"px-1 flex gap-2 items-center"}>
          {icon}
          <span className="px-2 font-bold text-foreground bg-background">
            {title}
          </span>
        </div>
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
