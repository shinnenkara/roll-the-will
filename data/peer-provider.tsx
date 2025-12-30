"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { createMessage, useRoomPeer } from "@/lib/use-room-peer";
import { Player, usePlayer } from "@/data/player-provider";
import { Room, useRoom } from "@/data/room-provider";
import { DiceType } from "@/data/dices";

interface PeerContextType {
  // TODO: remove code from create, generate on create
  createRoom: (code: string) => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  rollRequest: (diceType: DiceType) => Promise<void>;
}

const PeerContext = createContext<PeerContextType | undefined>(undefined);

export function PeerProvider({ children }: { children: React.ReactNode }) {
  const { player } = usePlayer();
  const { room, setRoom, rollDice } = useRoom();
  const { createPeer, joinPeer, sendToHost, broadcast } = useRoomPeer();

  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const createRoom = async (code: string) => {
    if (!player) {
      throw new Error(`Failed to load Player info`);
    }

    setRoom({
      id: code,
      players: [player],
      host: player,
      master: player,
      rolls: [],
    });

    const handleNewPlayer = (player: Player): Room => {
      const roomData = roomRef.current;
      if (!roomData) {
        throw new Error(`Failed to load Room info`);
      }

      const newRoom: Room = {
        ...roomData,
        players: [...roomData.players, player],
      };
      setRoom(newRoom);

      return newRoom;
    };

    const handleNewRoll = (playerId: string, diceType: DiceType): Room => {
      const roomData = roomRef.current;
      if (!roomData) {
        throw new Error(`Failed to load Room info`);
      }

      const newRoll = rollDice(playerId, diceType);

      const newRoom: Room = {
        ...roomData,
        rolls: [newRoll, ...roomData.rolls].slice(0, 100),
      };
      setRoom(newRoom);

      return newRoom;
    };

    await createPeer(code, handleNewPlayer, handleNewRoll);

    await new Promise((res) => setTimeout(res, 1000));
  };

  const joinRoom = async (code: string) => {
    if (!player) {
      throw new Error(`Failed to load Player info`);
    }

    const joinHandler = (roomData: Room) => {
      setRoom(roomData);
    };

    await joinPeer(player, code, joinHandler);
  };

  const rollRequest = async (diceType: DiceType) => {
    if (!player) {
      throw new Error(`Failed to load Player info`);
    }

    const roomData = roomRef.current;
    if (!roomData) {
      throw new Error(`Failed to load Room info`);
    }

    if (roomData.host.id !== player.id) {
      await sendToHost(
        createMessage("ROLL_REQUEST", {
          playerId: player.id,
          diceType: diceType,
        }),
      );
      return;
    }

    const newRoll = rollDice(player.id, diceType);
    const newRoom: Room = {
      ...roomData,
      rolls: [newRoll, ...roomData.rolls].slice(0, 50),
    };
    setRoom(newRoom);
    await broadcast(createMessage("STATE_UPDATE", { room: newRoom }));
  };

  return (
    <PeerContext.Provider value={{ createRoom, joinRoom, rollRequest }}>
      {children}
    </PeerContext.Provider>
  );
}

export function usePeer() {
  const context = useContext(PeerContext);
  if (context === undefined) {
    throw new Error("usePeer must be used within a PeerProvider");
  }

  return context;
}
