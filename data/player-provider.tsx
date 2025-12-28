"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface Player {
  id: string;
  name: string;
}

interface PlayerContextType {
  player: Player | null;
  setPlayer: (player: Player) => void;
  isLoading: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setLoading] = useState(true);

  const getStored = () => {
    try {
      const stored = localStorage.getItem("rtw_player");
      if (!stored) {
        return null;
      }

      return JSON.parse(stored);
    }
    catch {
      return null;
    }
  }

  useEffect(() => {
    // Next.js render first on backend - there are no localStorage
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlayer(getStored);
    setLoading(false);
  }, [])

  useEffect(() => {
    if (!player) {
      return;
    }

    localStorage.setItem("rtw_player", JSON.stringify(player));
  }, [player]);

  return (
    <PlayerContext.Provider value={{ player, setPlayer, isLoading }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }

  return context;
}
