"use client";

import { History } from "lucide-react";
import { RetroWindow } from "@/components/retro-window";
import { RollResult } from "@/data/room-provider";

interface RollHistoryProps {
  rolls: RollResult[];
}

export function RollHistory({ rolls }: RollHistoryProps) {
  return (
    <RetroWindow
      icon={
        <div className={"pixel-icon bg-background"}>
          <History size={16} />
        </div>
      }
      title={"History"}
    >
      <div className="max-h-[200px] overflow-y-auto">
        {rolls.length === 0 ? (
          <p className="text-center text-sm p-2 dither">
            <span className="bg-white px-1">No rolls yet</span>
          </p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {rolls.slice(0, 10).map((roll) => (
              <li
                key={roll.id}
                className="flex items-center justify-between border-b border-black pb-1"
              >
                <span className="truncate max-w-[100px]">
                  {roll.playerName}
                </span>
                <span className="uppercase">{roll.diceType}</span>
                <span className="font-bold w-8 text-right">{roll.result}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RetroWindow>
  );
}
