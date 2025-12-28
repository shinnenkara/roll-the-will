"use client";

import React, { createContext, useContext, useState } from "react";
import { Player } from "@/data/player-provider";
import { dices, DiceType } from "@/data/dices";

export interface RollResult {
  id: string;
  playerId: string;
  playerName: string;
  diceType: DiceType;
  result: number;
  timestamp: number;
  isCheat?: boolean;
}

export interface Room {
  id: string;
  host: Player;
  master: Player;
  players: Player[];
  rolls: RollResult[];
}

interface RoomContextType {
  room: Room | null;
  setRoom: (room: Room) => void;
  isLoading: boolean;
  rollDice: (playerId: string, dice: DiceType) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setLoading] = useState(false);

  const rollDice = (playerId: string, dice: DiceType) => {
    if (!room) return;

    const player = room.players.find((player) => player.id === playerId);
    if (!player) return;

    const result = Math.floor(Math.random() * dices[dice].maxValue) + 1;
    const roll: RollResult = {
      id: crypto.randomUUID(),
      playerId,
      playerName: player.name,
      diceType: dice,
      result,
      timestamp: Date.now(),
    };

    setRoom({
      ...room,
      rolls: [roll, ...room.rolls],
    });
  };

  return (
    <RoomContext.Provider value={{ room, setRoom, isLoading, rollDice }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }

  return context;
}
