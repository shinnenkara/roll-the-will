import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PlayerProvider } from "@/data/player-provider";
import { Footer } from "@/components/footer";
import React from "react";
import { RoomProvider } from "@/data/room-provider";
import { PeerProvider } from "@/data/peer-provider";

const font = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start-2p",
});

export const metadata: Metadata = {
  title: "Roll The Will",
  description: "A retro multiplayer dice-rolling experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} ${font.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PlayerProvider>
            <RoomProvider>
              <PeerProvider>
                <main className="min-h-screen relative scanlines">
                  {children}
                  <Footer />
                </main>
              </PeerProvider>
            </RoomProvider>
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
