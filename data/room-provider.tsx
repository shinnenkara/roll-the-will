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

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  timestamp: number;
}

export interface Room {
  id: string;
  status: "open" | "closed"
  host: Player;
  master: Player;
  players: Player[];
  activePlayers: Player[];
  rolls: RollResult[];
  messages: ChatMessage[];
}

interface RoomContextType {
  room: Room | null;
  setRoom: (room: Room | null) => void;
  rollDice: (playerId: string, dice: DiceType) => RollResult;
  cheatDice: (playerId: string, dice: DiceType, value: number) => RollResult;
  createChatMessage: (playerId: string, content: string) => ChatMessage;
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

  const cheatDice = (playerId: string, dice: DiceType, value: number): RollResult => {
    const roomData = roomRef.current;
    if (!roomData) {
      throw new Error(`Failed to load Room info`);
    }

    const player = roomData.players.find((player) => player.id === playerId);
    if (!player) {
      throw new Error(`Failed to load Player info`)
    }

    return {
      id: crypto.randomUUID(),
      playerId,
      playerName: player.name,
      diceType: dice,
      result: value,
      timestamp: Date.now(),
      isCheat: true,
    };
  };


  const createChatMessage = (playerId: string, content: string): ChatMessage => {
    const roomData = roomRef.current;
    if (!roomData) {
      throw new Error(`Failed to load Room info`);
    }

    const player = roomData.players.find((player) => player.id === playerId);
    if (!player) {
      throw new Error(`Failed to load Player info`);
    }

    return {
      id: crypto.randomUUID(),
      playerId,
      playerName: player.name,
      content,
      timestamp: Date.now(),
    };
  };

  return (
    <RoomContext.Provider value={{ room, setRoom, rollDice, cheatDice, createChatMessage }}>
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
