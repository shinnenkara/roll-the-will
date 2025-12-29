import { RetroInput } from "@/components/retro-input";
import { RetroTooltip } from "@/components/retro-tooltip";
import { RetroButton } from "@/components/retro-button";
import { Check, Copy } from "lucide-react";
import React, { useState } from "react";

type Props = {
  code: string;
  className?: string;
};

export function RoomCode({ code, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-fit">
      <div className={"bg-background"}>
        <RetroInput
          value={code}
          className={`${className} text-center tracking-widest h-auto`}
          autoFocus
          readOnly
        />
      </div>
      <div className="hidden sm:block absolute left-full top-1/2 -translate-y-1/2 ml-2">
        <RetroTooltip tooltip={copied ? "Copied!" : "Copy Code"}>
          <RetroButton onClick={copyToClipboard}>
            {copied ? (
              <Check size={24} strokeWidth={3} />
            ) : (
              <Copy size={24} strokeWidth={3} />
            )}
          </RetroButton>
        </RetroTooltip>
      </div>
    </div>
  );
}
