"use client";

import { Crown, Router, User, Wifi } from "lucide-react";
import { Player } from "@/data/player-provider";
import { RetroTooltip } from "@/components/retro-tooltip";
import { RetroWindow } from "@/components/retro-window";

function PlayerListIcon({ isHost }: { isHost: boolean }) {
  if (isHost) {
    return (
      <RetroTooltip tooltip={"You are the Host"}>
        <div className={"pixel-icon bg-background"}>
          <Router size={16} />
        </div>
      </RetroTooltip>
    );
  }

  return (
    <RetroTooltip tooltip={"You are Connected to the Host"}>
      <div className={"pixel-icon bg-background"}>
        <Wifi size={16} />
      </div>
    </RetroTooltip>
  );
}

interface PlayerListProps {
  players: Player[];
  hostId: string;
  currentPlayerId: string;
}

export function PlayerList({
  players,
  hostId,
  currentPlayerId,
}: PlayerListProps) {
  return (
    <RetroWindow
      icon={<PlayerListIcon isHost={currentPlayerId === hostId} />}
      title={`Players (${players.length})`}
      className={"h-full"}
    >
      <ul className="flex flex-col gap-1">
        {players.map((player) => (
          <li
            key={player.id}
            className={`flex items-center gap-2 p-2 border-2 border-foreground bg-background`}
          >
            {player.id === hostId ? (
              <RetroTooltip tooltip={"Room Master"}>
                <div className={"pixel-icon bg-background"}>
                  <Crown size={18} />
                </div>
              </RetroTooltip>
            ) : (
              <RetroTooltip tooltip={"Player"}>
                <div className={"pixel-icon bg-background"}>
                  <User size={18} />
                </div>
              </RetroTooltip>
            )}
            <span className={`text truncate`}>
              {player.name}
              {player.id === currentPlayerId && " (You)"}
            </span>
          </li>
        ))}
      </ul>
    </RetroWindow>
  );
}
