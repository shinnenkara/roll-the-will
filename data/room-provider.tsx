"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  rollDice: (playerId: string, dice: DiceType) => RollResult;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);

  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const rollDice = (playerId: string, dice: DiceType): RollResult => {
    const roomData = roomRef.current;
    if (!roomData) {
      throw new Error(`Failed to load Room info`);
    }

    const player = roomData.players.find((player) => player.id === playerId);
    if (!player) {
      throw new Error(`Failed to load Player info`)
    }

    const result = Math.floor(Math.random() * dices[dice].maxValue) + 1;

    return {
      id: crypto.randomUUID(),
      playerId,
      playerName: player.name,
      diceType: dice,
      result,
      timestamp: Date.now(),
    };
  };

  return (
    <RoomContext.Provider value={{ room, setRoom, rollDice }}>
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
