"use client";

import type React from "react";
import { RetroWindow } from "@/components/retro-window";
import { ASCIITitle } from "@/components/ascii-title";
import { Footer } from "@/components/footer";
import { NameForm } from "@/components/name-form";

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative scanlines">
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

      <Footer />
    </main>
  );
}
