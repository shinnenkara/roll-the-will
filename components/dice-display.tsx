"use client";

import { RetroWindow } from "@/components/retro-window";
import { RollResult } from "@/data/room-provider";

interface RollResultDisplayProps {
  result: RollResult | null;
  isRolling: boolean;
}

export function DiceDisplay({ result, isRolling }: RollResultDisplayProps) {
  return (
    <RetroWindow title={"Roll Result"}>
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        {isRolling ? (
          <div className="text-center">
            <div className="text-8xl stutter-animation">?</div>
            <p className="text-xl mt-4">Rolling...</p>
          </div>
        ) : result ? (
          <div className="text-center">
            <div className="border-4 border-foreground p-6 inline-block mb-4 shadow-retro">
              <span className="text-8xl font-bold">{result.result}</span>
            </div>
            <p className="text-xl">
              {result.playerName} rolled {result.diceType.toUpperCase()}
            </p>
            {result.isCheat && (
              <p className="text-sm mt-2 dither inline-block px-2 py-1">
                <span className="bg-background px-1">* Fate was sealed *</span>
              </p>
            )}
          </div>
        ) : (
          <div className="text-center dither p-8">
            <p className="text-2xl bg-background px-4 py-2">
              Select a die to roll!
            </p>
          </div>
        )}
      </div>
    </RetroWindow>
  );
}
