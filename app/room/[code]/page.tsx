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
import { ChatBox } from "@/components/chat-box";
import { DiceType } from "@/data/dices";
import { usePeer } from "@/data/peer-provider";
import { RetroDialog } from "@/components/retro-dialog";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.code as string;
  const { player } = usePlayer();
  const { room } = useRoom();
  const [isRolling, setIsRolling] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const { rollRequest, sendMessage, leaveRoom } = usePeer();

  const handleDialogClose = () => {
    router.replace(`/room/${roomCode}`);
  };

  const handleLeaveRoom = () => {
    if (room && player && room.host.id === player.id) {
      setIsLeaveDialogOpen(true);
      return;
    }

    leaveRoom();
    router.push("/lobby");
  };

  const confirmLeave = () => {
    leaveRoom();
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

  const handleSendMessage = async (content: string) => {
    if (!player) return;
    await sendMessage(content);
  };

  useEffect(() => {
    if (!player) {
      router.push("/");
    }

  }, [player, router]);

  useEffect(() => {
    if (!room) {
      router.push("/lobby");
    }
  }, [router, roomCode, room]);

  useEffect(() => {
    if (!room || !player) return;
    if (room.host.id !== player.id) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Included for legacy support, e.g. Chrome/Edge < 119
      e.returnValue = true;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [room, player]);

  if (!player || !room) return null;

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
          <div className={"pl-1 md:pr-16"}>
            <RoomCode code={roomCode} className={"w-36"} />
          </div>
        </div>
      </header>

      <div className="flex-1 p-2">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-4 h-full">
          <aside className="lg:col-span-2 flex flex-col gap-4">
            {/* TODO: generate random icons for players, set max amount, add info cards */}
            <PlayerList
              players={room.activePlayers}
              hostId={room.host.id}
              currentPlayerId={player.id}
            />
            <ChatBox
              className="hidden lg:flex"
              messages={room.messages}
              onSendMessage={handleSendMessage}
              currentPlayerId={player.id}
            />
          </aside>

          <div className="lg:col-span-4 flex flex-col gap-4 pb-10">
            <DiceDisplay
              players={room.activePlayers}
              rolls={room.rolls}
              currentPlayerId={player.id}
              isRolling={isRolling}
            />
            <DiceTray onRoll={handleRoll} disabled={isRolling} />
            <RollHistory rolls={room.rolls} />
            <ChatBox
              className="lg:hidden flex"
              messages={room.messages}
              onSendMessage={handleSendMessage}
              currentPlayerId={player.id}
            />
          </div>
        </div>
      </div>

      <RetroDialog
        onClose={handleDialogClose}
        footer={(close) => {
          return (
            <div className={"flex flex-col items-center"}>
              <RetroButton
                onClick={() => {
                  handleDialogClose();
                  close();
                }}
              >
                [ START GAME ]
              </RetroButton>
            </div>
          );
        }}
      >
        <div className="flex flex-col items-center gap-6 pb-6">
          <p className="text-xl text-center">Your room code is:</p>
          <RoomCode code={roomCode} className={"w-60 md:text-2xl"} />
          <p className="text-sm text-center dither p-2">
            <span className="bg-background px-2">
              Share this code with other players
            </span>
          </p>
        </div>
      </RetroDialog>

      {isLeaveDialogOpen && (
        <RetroDialog
          title="End Game?"
          initialOpen={true}
          onClose={() => setIsLeaveDialogOpen(false)}
          footer={(close) => (
            <div className="flex gap-4 justify-center">
              <RetroButton onClick={close}>[ Cancel ]</RetroButton>
              <RetroButton
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  confirmLeave();
                  close();
                }}
              >
                [ End Game ]
              </RetroButton>
            </div>
          )}
        >
          <div className="flex flex-col items-center gap-4 pb-4 px-4">
            <p className="text-center">
              You are the host. Leaving will close the room for everyone.
            </p>
            <p className="text-center text-red-500 font-bold dither p-2">
              <span className="bg-background px-2">Are you sure?</span>
            </p>
          </div>
        </RetroDialog>
      )}

      {room.status === "closed" && (
        <RetroDialog
          title="Disconnected"
          initialOpen={true}
          onClose={() => router.push("/lobby")}
          footer={(close) => (
            <div className="flex justify-center">
              <RetroButton
                onClick={() => {
                  leaveRoom();
                  router.push("/lobby");
                }}
              >
                [ Return to Lobby ]
              </RetroButton>
            </div>
          )}
        >
          <div className="flex flex-col items-center gap-4 pb-4 px-4">
            <p className="text-center text-destructive font-bold">
              CONNECTION LOST
            </p>
            <p className="text-center">
              The host has closed the room or the connection was lost.
            </p>
          </div>
        </RetroDialog>
      )}
    </div>
  );
}
