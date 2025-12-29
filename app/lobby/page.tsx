"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderOpen, FolderPlus } from "lucide-react";
import { RetroWindow } from "@/components/retro-window";
import { RetroButton } from "@/components/retro-button";
import { RetroInput } from "@/components/retro-input";
import { RetroTooltip } from "@/components/retro-tooltip";
import { usePlayer } from "@/data/player-provider";
import { generateRoomCode } from "@/lib/generate-room-code";
import { RoomCode } from "@/components/room-code";
import { LoadingScreen } from "@/components/loading-screen";
import { usePeer } from "@/data/peer-provider";

export default function LobbyPage() {
  const router = useRouter();
  const { player } = usePlayer();
  const { createRoom, joinRoom } = usePeer();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading player");

  const [activePanel, setActivePanel] = useState<"none" | "create" | "join">(
    "none",
  );
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!player) {
      router.push("/");
    }
  }, [router, player]);

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    setRoomCode(code);
    setActivePanel("create");
  };

  const handleConfirmCreate = async () => {
    if (!player) {
      console.error(`Failed to load Player info`);
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Creating Room");

    try {
      await createRoom(roomCode);
      router.push(`/room/${roomCode}`);
    } catch {
      console.error("Failed to create room. Please try again.");
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!player) {
      console.error(`Failed to load Player info`);
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Joining Room");

    try {
      await joinRoom(roomCode);
      router.push(`/room/${roomCode}`);
    } catch {
      console.error("Failed to join room. Please try again.");
      setIsLoading(false);
    }
  };

  const handlePanelClose = () => {
    setActivePanel("none");
    setRoomCode("");
  };

  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }

  if (!player) return null;

  return (
    <div className={"p-2 min-h-screen flex items-center justify-center"}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-16 radial-background opacity-30" />
        <div className="absolute bottom-16 left-0 w-full h-16 radial-background opacity-30" />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="border-2 border-foreground bg-background mb-4 p-2 flex items-center justify-between shadow-retro">
          <RetroTooltip tooltip={"Back to Welcome"}>
            <RetroButton onClick={() => router.push("/")}>
              <ArrowLeft size={20} strokeWidth={3} />
            </RetroButton>
          </RetroTooltip>
          <span className="text-2xl">LOBBY</span>
          <span className="text-xl border-2 border-foreground px-2 py-1 dither">
            <span className="bg-background px-1">{player.name}</span>
          </span>
        </div>

        {/* Main Content */}
        {activePanel === "none" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Create Room Folder */}
            <button
              onClick={handleCreateRoom}
              className="retro-window p-6 flex flex-col items-center gap-4 hover:bg-foreground hover:text-background group cursor-pointer"
            >
              <div className="w-24 h-20 border-2 border-current flex items-center justify-center relative">
                <div className="absolute -top-2 left-2 w-8 h-4 border-2 border-current bg-background group-hover:bg-foreground" />
                <div className={"pixel-icon"}>
                  <FolderPlus size={40} strokeWidth={3} />
                </div>
              </div>
              <span className="text-2xl">CREATE ROOM</span>
              <span className="text-sm">Start a new game</span>
            </button>

            {/* Join Room Folder */}
            <button
              onClick={() => setActivePanel("join")}
              className="retro-window p-6 flex flex-col items-center gap-4 hover:bg-foreground hover:text-background group cursor-pointer"
            >
              <div className="w-24 h-20 border-2 border-current flex items-center justify-center relative">
                <div className="absolute -top-2 left-2 w-8 h-4 border-2 border-current bg-background group-hover:bg-foreground" />
                <div className={"pixel-icon"}>
                  <FolderOpen size={40} strokeWidth={3} />
                </div>
              </div>
              <span className="text-2xl">JOIN ROOM</span>
              <span className="text-sm">Enter room code</span>
            </button>
          </div>
        )}

        {/* Create Room Panel */}
        {activePanel === "create" && (
          <RetroWindow
            title="Create Room"
            onClose={() => setActivePanel("none")}
          >
            {/* TODO: move room code as a popup after creation */}
            <div className="flex flex-col items-center gap-6">
              <p className="text-xl text-center">Your room code is:</p>
              <RoomCode code={roomCode} className={"w-60 md:text-2xl"} />
              <p className="text-sm text-center dither p-2">
                <span className="bg-background px-2">
                  Share this code with other players
                </span>
              </p>
              <RetroButton onClick={handleConfirmCreate}>
                [ CREATE & ENTER ]
              </RetroButton>
            </div>
          </RetroWindow>
        )}

        {/* Join Room Panel */}
        {activePanel === "join" && (
          <RetroWindow title="Join Room" onClose={handlePanelClose}>
            <form
              onSubmit={handleJoinRoom}
              className="flex flex-col items-center gap-6"
            >
              <p className="text-xl text-center">Enter the room code:</p>

              <RetroInput
                placeholder="XXXXXX"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError("");
                }}
                maxLength={6}
                className="text-center text-xl md:text-2xl tracking-[0.3em] w-48 uppercase"
                autoFocus
              />
              {error && (
                <div className="border-2 border-black p-2 bg-black text-white text-center">
                  <span className="stutter-animation inline-block">!</span>{" "}
                  {error}
                </div>
              )}
              <RetroButton disabled={roomCode.length < 6}>
                [ JOIN ROOM ]
              </RetroButton>
            </form>
          </RetroWindow>
        )}
      </div>
    </div>
  );
}
