"use client";

import type React from "react";
import { RetroWindow } from "@/components/retro-window";
import { ASCIITitle } from "@/components/ascii-title";
import { NameForm } from "@/components/name-form";
import { usePlayer } from "@/data/player-provider";
import { LoadingScreen } from "@/components/loading-screen";

export default function WelcomePage() {
  const { isLoading } = usePlayer();

  if (isLoading) {
    return <LoadingScreen message="Checking profile" />;
  }

  return (
    <div className={"p-2 min-h-screen flex items-center justify-center"}>
      {/* Decorative dither corners */}
      <div className="fixed top-0 left-0 w-32 h-32 radial-background opacity-50" />
      <div className="fixed top-0 right-0 w-32 h-32 radial-background opacity-50" />
      <div className="fixed bottom-16 left-0 w-32 h-32 radial-background opacity-50" />
      <div className="fixed bottom-16 right-0 w-32 h-32 radial-background opacity-50" />

      <RetroWindow title="Welcome" className="w-full max-w-md">
        <div className="flex flex-col items-center gap-6">
          <ASCIITitle />
          <NameForm />
        </div>
      </RetroWindow>
    </div>
  );
}
