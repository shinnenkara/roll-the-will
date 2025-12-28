"use client";

import { Coffee, Github } from "lucide-react";
import { RetroButtonIcon } from "@/components/retro-button-icon";
import { ModeToggle } from "@/components/mode-toggle";
import { RetroTooltip } from "@/components/retro-tooltip";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t-2 border-foreground bg-background p-2">
      <div className="flex items-center justify-between">
        <a
          href="https://github.com/shinnenkara"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline"
        >
          <RetroTooltip tooltip={"Visit GitHub"}>
            <RetroButtonIcon>
              <Github />
            </RetroButtonIcon>
          </RetroTooltip>
          <span className="text-xs">shinnenkara</span>
        </a>
        <a
          href="https://ko-fi.com/shinnenkara"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline"
        >
          <RetroTooltip tooltip={"Buy me a Ko-Fi"}>
            <RetroButtonIcon>
              <Coffee />
            </RetroButtonIcon>
          </RetroTooltip>
          <span className="text-xs">Support the Project</span>
        </a>
        <ModeToggle />
      </div>
    </footer>
  );
}
