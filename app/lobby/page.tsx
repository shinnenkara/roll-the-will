"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, FolderOpen, FolderPlus } from "lucide-react";
import { RetroWindow } from "@/components/retro-window";
import { RetroButton } from "@/components/retro-button";
import { RetroInput } from "@/components/retro-input";
import { Footer } from "@/components/footer";
import { RetroTooltip } from "@/components/retro-tooltip";
import { usePlayer } from "@/components/player-provider";

export default function LobbyPage() {
  const router = useRouter();
  const { player } = usePlayer();

  const [activePanel, setActivePanel] = useState<"none" | "create" | "join">(
    "none",
  );
  const [roomCode, setRoomCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!player) {
      router.push("/");
    }
  }, [router, player]);

  const handleCreateRoom = () => {};

  const handleConfirmCreate = () => {};

  const handleJoinRoom = () => {};

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!player) return null;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative scanlines">
      {/* Decorative dither pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-16 radial-background opacity-30" />
        <div className="absolute bottom-16 left-0 w-full h-16 radial-background opacity-30" />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="border-2 border-foreground bg-background mb-4 p-2 flex items-center justify-between shadow-[4px_4px_0px_0px_#000]">
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
              className="retro-window p-6 flex flex-col items-center gap-4"
              disabled={true}
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
            <div className="flex flex-col items-center gap-6">
              <p className="text-xl text-center">Your room code is:</p>

              <div className="flex items-center gap-2">
                <div className="text-4xl tracking-[0.5em] border-2 border-black px-6 py-4 font-mono bg-white">
                  {generatedCode}
                </div>
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

              <p className="text-sm text-center dither p-2">
                <span className="bg-white px-2">
                  Share this code with other players
                </span>
              </p>

              <RetroTooltip tooltip={"Create and enter the room"}>
                <RetroButton onClick={handleConfirmCreate}>
                  [ CREATE & ENTER ]
                </RetroButton>
              </RetroTooltip>
            </div>
          </RetroWindow>
        )}

        {/* Join Room Panel */}
        {activePanel === "join" && (
          <RetroWindow title="Join Room" onClose={() => setActivePanel("none")}>
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
                className="text-center text-2xl tracking-[0.3em] w-48 uppercase"
                autoFocus
              />

              {error && (
                <div className="border-2 border-black p-2 bg-black text-white text-center">
                  <span className="stutter-animation inline-block">!</span>{" "}
                  {error}
                </div>
              )}

              <RetroTooltip tooltip={"Join the room"}>
                <RetroButton disabled={roomCode.length < 6}>
                  [ JOIN ROOM ]
                </RetroButton>
              </RetroTooltip>
            </form>
          </RetroWindow>
        )}
      </div>

      <Footer />
    </main>
  );
}
