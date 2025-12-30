"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderOpen, FolderPlus } from "lucide-react";
import { RetroWindow } from "@/components/retro-window";
import { RetroButton } from "@/components/retro-button";
import { RetroInput } from "@/components/retro-input";
import { RetroTooltip } from "@/components/retro-tooltip";
import { usePlayer } from "@/data/player-provider";
import { LoadingScreen } from "@/components/loading-screen";
import { usePeer } from "@/data/peer-provider";
import { RetroDialog } from "@/components/retro-dialog";

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
  const [showConnectionTips, setShowConnectionTips] = useState<
    "create" | "join" | null
  >(null);

  useEffect(() => {
    if (!player) {
      router.push("/");
    }
  }, [router, player]);

  const handleCreateRoom = () => {
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
      const code = await createRoom();
      router.push(`/room/${code}?new=true`);
    } catch {
      setIsLoading(false);
      setShowConnectionTips("create");
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
      setIsLoading(false);
      setShowConnectionTips("join");
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
            <div className="flex flex-col items-center gap-6">
              <p className="text-xl text-center">
                Ready to start a new adventure?
              </p>
              <RetroButton onClick={handleConfirmCreate}>
                [ CREATE ROOM ]
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
                className="text-center text-xl md:text-xl tracking-[0.3em] w-48 uppercase"
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

        {showConnectionTips && (
          <RetroDialog
            title={
              showConnectionTips === "create"
                ? "Hosting Trouble?"
                : "Joining Trouble?"
            }
            onClose={() => setShowConnectionTips(null)}
            footer={(close) => (
              <div className="flex justify-center w-full mt-4">
                <RetroButton onClick={close}>[ I UNDERSTAND ]</RetroButton>
              </div>
            )}
          >
            <div className="flex flex-col gap-4">
              <p className="text-center">
                It seems we are having trouble connecting. Here are some tips:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {showConnectionTips === "create" ? (
                  <>
                    <li>
                      Ensure you are not using <strong>public WiFi</strong> or{" "}
                      <strong>4G/5G</strong> networks.
                    </li>
                    <li>
                      Check if you are behind a <strong>corporate VPN</strong> or
                      strict firewall.
                    </li>
                    <li>
                      Disable ad-blockers or privacy extensions that might block
                      WebRTC.
                    </li>
                    <li>Try again in a couple of seconds.</li>
                  </>
                ) : (
                  <>
                    <li>
                      <strong>Double-check the room code.</strong> Ensure it
                      matches the host&apos;s screen.
                    </li>
                    <li>
                      Ensure you are not behind a <strong>corporate VPN</strong>{" "}
                      or strict firewall.
                    </li>
                    <li>
                      Disable ad-blockers or privacy extensions that might block
                      WebRTC.
                    </li>
                    <li>
                      If issues persist, ask the Host to check their connection.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </RetroDialog>
        )}
      </div>
    </div>
  );
}
