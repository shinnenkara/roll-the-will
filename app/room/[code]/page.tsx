"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { RetroButton } from "@/components/retro-button";
import { RetroTooltip } from "@/components/retro-tooltip";
import { RoomCode } from "@/components/room-code";
import { usePlayer } from "@/data/player-provider";
import { PlayerList } from "@/components/player-list";
import { useRoom } from "@/data/room-provider";
import { DiceTray } from "@/components/dice-tray";
import { DiceDisplay } from "@/components/dice-display";
import { RollHistory } from "@/components/roll-history";
import { DiceType } from "@/data/dices";
import { usePeer } from "@/data/peer-provider";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.code as string;
  const { player } = usePlayer();
  const { room } = useRoom();
  const [isRolling, setIsRolling] = useState(false);
  const { rollRequest } = usePeer();

  const handleLeaveRoom = () => {
    router.push("/lobby");
  };

  const handleRoll = useCallback(
    async (diceType: DiceType) => {
      if (!player) return;

      setIsRolling(true);
      await rollRequest(diceType);
      // Stuttery animation delay
      setTimeout(() => setIsRolling(false), 600);
    },
    [player, rollRequest],
  );

  useEffect(() => {
    if (player) {
      return;
    }

    console.error(`Failed to load Player info`);
    router.push("/");
  }, [player, router]);

  useEffect(() => {
    if (!room) {
      console.error(`Failed to load Room: ${roomCode}`);
      router.push("/lobby");
    }
  }, [router, roomCode, room]);

  if (!player || !room) return null;

  const latestRoll = room.rolls[0] || null;

  return (
    <div className={"min-h-screen flex flex-col"}>
      <header className="border-b-2 border-foreground bg-background sticky radial-background top-0 z-40">
        <div className="px-2 py-1 retro-title-bar flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RetroTooltip tooltip={"Leave the room"}>
              <RetroButton onClick={handleLeaveRoom}>
                <LogOut size={18} strokeWidth={3} />
              </RetroButton>
            </RetroTooltip>
            <span className="flex text-xl bg-background px-2">
              Roll The Will
            </span>
          </div>
          <div className={"pr-16"}>
            <RoomCode code={roomCode} className={"w-32"} />
          </div>
        </div>
      </header>

      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-4 h-full">
          <aside className="lg:col-span-2">
            {/* TODO: generate random icons for players, set max amount, add info cards */}
            <PlayerList
              players={room.players}
              hostId={room.host.id}
              currentPlayerId={player.id}
            />
          </aside>

          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* TODO: show every person last rolls */}
            <DiceDisplay result={latestRoll} isRolling={isRolling} />
            <DiceTray onRoll={handleRoll} disabled={isRolling} />
            {/* TODO: move to the side, show when exactly rolled */}
            <RollHistory rolls={room.rolls} />
            {/* TODO: add chat to the bottom */}
          </div>
        </div>
      </div>
    </div>
  );
}
