"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { createMessage, useRoomPeer } from "@/lib/use-room-peer";
import { Player, usePlayer } from "@/data/player-provider";
import { Room, useRoom } from "@/data/room-provider";
import { DiceType } from "@/data/dices";
import { generateRoomCode } from "@/lib/generate-room-code";

interface PeerContextType {
  createRoom: () => Promise<string>;
  joinRoom: (code: string) => Promise<void>;
  leaveRoom: () => void;
  rollRequest: (diceType: DiceType) => Promise<void>;
  cheatRollRequest: (diceType: DiceType, diceValue: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

const PeerContext = createContext<PeerContextType | undefined>(undefined);

export function PeerProvider({ children }: { children: React.ReactNode }) {
  const { player } = usePlayer();
  const { room, setRoom, rollDice, cheatDice, createChatMessage } = useRoom();
  const { createPeer, joinPeer, sendToHost, broadcast, disconnect } =
    useRoomPeer();

  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const createRoom = async (): Promise<string> => {
    if (!player) {
      throw new Error(`Failed to load Player info`);
    }

    const code = generateRoomCode();
    setRoom({
      id: code,
      status: "open",
      players: [player],
      activePlayers: [player],
      host: player,
      master: player,
      rolls: [],
      messages: [],
    });

    const handleNewPlayer = (player: Player): Room => {
      const roomData = roomRef.current;
      if (!roomData) {
        throw new Error(`Failed to load Room info`);
      }

      const newRoom: Room = {
        ...roomData,
        players: [...roomData.players, player],
        activePlayers: [...roomData.activePlayers, player],
      };
      setRoom(newRoom);
      broadcast(createMessage("STATE_UPDATE", { room: newRoom }));

      return newRoom;
    };

    const handlePlayerLeave = (playerId: string): Room => {
      const roomData = roomRef.current;
      if (!roomData) {
        throw new Error(`Failed to load Room info`);
      }

      const newRoom: Room = {
        ...roomData,
        activePlayers: roomData.activePlayers.filter((p) => p.id !== playerId),
      };
      setRoom(newRoom);
      broadcast(createMessage("STATE_UPDATE", { room: newRoom }));
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
      broadcast(createMessage("STATE_UPDATE", { room: newRoom }));

      return newRoom;
    };

    const handleNewMessage = (playerId: string, content: string): Room => {
      const roomData = roomRef.current;
      if (!roomData) {
        throw new Error(`Failed to load Room info`);
      }

      const newMessage = createChatMessage(playerId, content);

      const newRoom: Room = {
        ...roomData,
        messages: [...(roomData.messages || []), newMessage].slice(-100),
      };
      setRoom(newRoom);
      broadcast(createMessage("STATE_UPDATE", { room: newRoom }));

      return newRoom;
    };

    await createPeer(
      code,
      handleNewPlayer,
      handlePlayerLeave,
      handleNewRoll,
      handleNewMessage,
    );

    await new Promise((res) => setTimeout(res, 1000));

    return code;
  };

  const joinRoom = async (code: string) => {
    if (!player) {
      throw new Error(`Failed to load Player info`);
    }

    const joinHandler = (roomData: Room) => {
      setRoom(roomData);
    };

    const hostDisconnectHandler = () => {
      const roomData = roomRef.current;
      if (!roomData) return;

      setRoom({
        ...roomData,
        status: "closed",
      });
    };

    await joinPeer(player, code, joinHandler, hostDisconnectHandler);
  };

  const leaveRoom = () => {
    disconnect();
    setRoom(null);
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

  const cheatRollRequest = async (diceType: DiceType, diceValue: number) => {
    if (!player) {
      throw new Error(`Failed to load Player info`);
    }

    const roomData = roomRef.current;
    if (!roomData) {
      throw new Error(`Failed to load Room info`);
    }

    if (player.id !== roomData.master.id) {
      throw new Error(`Failed to load Master rights`);
    }

    const newRoll = cheatDice(player.id, diceType, diceValue);
    const newRoom: Room = {
      ...roomData,
      rolls: [newRoll, ...roomData.rolls].slice(0, 50),
    };
    setRoom(newRoom);
    await broadcast(createMessage("STATE_UPDATE", { room: newRoom }));
  }

  const sendMessage = async (content: string) => {
    if (!player) {
      throw new Error(`Failed to load Player info`);
    }

    const roomData = roomRef.current;
    if (!roomData) {
      throw new Error(`Failed to load Room info`);
    }

    if (roomData.host.id !== player.id) {
      await sendToHost(
        createMessage("MESSAGE_REQUEST", {
          playerId: player.id,
          content: content,
        }),
      );
      return;
    }

    const newMessage = createChatMessage(player.id, content);
    const newRoom: Room = {
      ...roomData,
      messages: [...(roomData.messages || []), newMessage].slice(-100),
    };
    setRoom(newRoom);
    await broadcast(createMessage("STATE_UPDATE", { room: newRoom }));
  };

  return (
    <PeerContext.Provider
      value={{ createRoom, joinRoom, leaveRoom, rollRequest, cheatRollRequest, sendMessage }}
    >
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
