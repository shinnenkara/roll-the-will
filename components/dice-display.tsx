"use client";

import { RetroWindow } from "@/components/retro-window";
import { RollResult } from "@/data/room-provider";
import { Player } from "@/data/player-provider";
import { dices } from "@/data/dices";

interface RollResultDisplayProps {
  players: Player[];
  rolls: RollResult[];
  currentPlayerId: string;
  isRolling: boolean;
}

export function DiceDisplay({
  players,
  rolls,
  currentPlayerId,
  isRolling,
}: RollResultDisplayProps) {
  const getLatestRoll = (playerId: string) =>
    rolls.find((r) => r.playerId === playerId);

  const getGridClass = () => {
    if (players.length <= 1) return "grid-cols-1 max-w-xl mx-auto w-full";
    if (players.length === 2) return "grid-cols-1 md:grid-cols-2";

    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <RetroWindow title={"Roll Results"}>
      <div
        className={`grid gap-4 p-2 min-h-[200px] ${getGridClass()}`}
      >
        {players.map((player) => {
          const latestRoll = getLatestRoll(player.id);
          const isCurrentPlayer = player.id === currentPlayerId;
          const showRolling = isCurrentPlayer && isRolling;

          return (
            <div
              key={player.id}
              className={`flex flex-col items-center justify-center border-2 border-foreground/20 p-4`}
            >
              <div className="text-sm font-bold mb-2 truncate w-full text-center">
                {player.name}
              </div>

              {showRolling ? (
                <div className="text-center">
                  <div className="text-4xl stutter-animation mb-2">?</div>
                  <p className="text-sm">Rolling...</p>
                </div>
              ) : latestRoll ? (
                <div className="text-center">
                  <div className="w-24 h-24 inline-block mb-2 text-foreground">
                    {dices[latestRoll.diceType].shape(latestRoll.result)}
                  </div>
                  <p className="text-sm">
                    Rolled {latestRoll.diceType.toUpperCase()}
                  </p>
                  {latestRoll.isCheat && (
                    <p className="text-xs mt-1 dither inline-block px-1">
                      <span className="bg-background px-1">* Fate sealed *</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-foreground/50 py-4">
                  <p className="text-sm italic">No rolls yet</p>
                </div>
              )}
            </div>
          );
        })}
        {players.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-xl">Waiting for players...</p>
          </div>
        )}
      </div>
    </RetroWindow>
  );
}
