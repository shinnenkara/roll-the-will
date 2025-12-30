import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#252525" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Roll The Will",
    template: "%s | Roll The Will",
  },
  description: "A retro multiplayer dice-rolling experience",
  applicationName: "Roll The Will",
  authors: [{ name: "Shinnenkara" }],
  keywords: ["dice", "multiplayer", "retro", "game", "rolling", "p2p", "webrtc"],
  referrer: "origin-when-cross-origin",
  creator: "shinnenkara",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://roll-the-will.vercel.app",
    title: "Roll The Will",
    description: "A retro multiplayer dice-rolling experience",
    siteName: "Roll The Will",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Roll The Will",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roll The Will",
    description: "A retro multiplayer dice-rolling experience",
    creator: "@shinnenkara",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    title: "Roll The Will",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL("https://roll-the-will.vercel.app"),
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
