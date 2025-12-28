import Peer, { DataConnection } from "peerjs";
import { generatePeerCode } from "@/lib/generate-peer-code";
import { useEffect, useRef, useState } from "react";
import { Room } from "@/data/room-provider";
import { Player } from "@/data/player-provider";
import { DiceType } from "@/data/dices";

export type P2PMessageType =
  | "JOIN"
  | "INIT_SYNC"
  | "STATE_UPDATE"
  | "ROLL_REQUEST"
  | "PING"
  | "PONG";

export interface P2PMessage {
  type: P2PMessageType;
  payload?: unknown;
  timestamp: number;
}

export const createMessage = (
  type: P2PMessage["type"],
  payload?: unknown,
): P2PMessage => {
  return { type, payload, timestamp: Date.now() };
};

export class RoomConnection {
  private readonly connection: DataConnection;

  constructor(connection: DataConnection) {
    this.connection = connection;
  }

  subscribe(
    onJoin: (player: Player) => Room,
    onRollRequest: (playerId: string, diceType: DiceType) => Room,
  ) {
    this.connection.on("data", (data) => {
      const message = data as P2PMessage;

      switch (message.type) {
        case "JOIN":
          const { player } = message.payload as { player: Player };
          const room = onJoin(player);
          this.initSync(room);
          break;
        case "ROLL_REQUEST": {
          const { playerId, diceType } = message.payload as {
            playerId: string;
            diceType: DiceType;
          };
          const room = onRollRequest(playerId, diceType);
          this.updateState(room);
          break;
        }
        case "PING":
          break;
        case "PONG":
          break;
        default:
          console.error(
            "Connection Error:",
            `Unknown message '${message.type}'`,
          );
      }
    });
  }

  private initSync(room: Room) {
    const message = createMessage("INIT_SYNC", { room: room });
    this.connection.send(message);
  }

  private updateState(room: Room) {
    const message = createMessage("STATE_UPDATE", { room: room });
    this.connection.send(message);
  }
}

export class PlayerConnection {
  private readonly connection: DataConnection;

  constructor(connection: DataConnection) {
    this.connection = connection;
  }

  subscribe(onJoin: (room: Room) => void) {
    this.connection.on("data", (data) => {
      const message = data as P2PMessage;

      switch (message.type) {
        case "INIT_SYNC":
        case "STATE_UPDATE":
          const { room } = message.payload as { room: Room };
          onJoin(room);
          break;
        case "PING":
          break;
        case "PONG":
          break;
        default:
          console.error("Connection Error:", "Unknown message");
      }
    });
  }

  join(player: Player) {
    const message = createMessage("JOIN", { player: player });
    this.connection.send(message);
  }
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

type RoomPeer = {
  id: string;
  status: ConnectionStatus;
  connections: RoomConnection[];
};

export const useRoomPeer = () => {
  const [roomPeer, setRoomPeer] = useState<RoomPeer>();

  const roomPeerRef = useRef(roomPeer);
  useEffect(() => {
    roomPeerRef.current = roomPeer;
  }, [roomPeer]);

  const createPeer = async (
    roomCode: string,
    onJoin: (player: Player) => Room,
    onRollRequest: (playerId: string, diceType: DiceType) => Room,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const peerCode = generatePeerCode(roomCode);
      setRoomPeer({
        id: peerCode,
        status: "connecting",
        connections: [],
      });

      const peer = new Peer(peerCode, { debug: 3 });

      const connectionTimeout = setTimeout(() => {
        peer.destroy();
        console.error("Peer error:", "Connection timeout");
        reject(new Error("Connection timeout"));
      }, 10000);

      peer.on("open", (id) => {
        clearTimeout(connectionTimeout);
        setRoomPeer({
          id: id,
          status: "connected",
          connections: [],
        });

        resolve(id);
      });

      peer.on("connection", (conn) => {
        conn.on("open", () => {
          const roomPeerData = roomPeerRef.current;
          if (!roomPeerData) return;

          const connection = new RoomConnection(conn);
          connection.subscribe(onJoin, onRollRequest);
          setRoomPeer({
            ...roomPeerData,
            connections: [...roomPeerData.connections, connection],
          });
        });
      });

      peer.on("error", (err) => {
        clearTimeout(connectionTimeout);
        setRoomPeer({
          id: peerCode,
          status: "error",
          connections: [],
        });
        console.error("Peer error:", err);
        reject(err);
      });

      peer.on("disconnected", () => {
        clearTimeout(connectionTimeout);
        setRoomPeer({
          id: peerCode,
          status: "disconnected",
          connections: [],
        });
        peer.reconnect();
      });
    });
  };

  const joinPeer = async (
    player: Player,
    roomCode: string,
    onJoin: (room: Room) => void,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const peerCode = generatePeerCode(player.id);
      setRoomPeer({
        id: peerCode,
        status: "connecting",
        connections: [],
      });
      const peer = new Peer(peerCode, { debug: 3 });

      const connectionTimeout = setTimeout(() => {
        peer.destroy();
        console.error("Peer error:", "Connection timeout");
        reject(new Error("Connection timeout"));
      }, 10000);

      peer.on("open", (id) => {
        clearTimeout(connectionTimeout);
        setRoomPeer({
          id: id,
          status: "connected",
          connections: [],
        });

        const roomPeerCode = generatePeerCode(roomCode);
        const conn = peer.connect(roomPeerCode, { reliable: true });

        const syncTimeout = setTimeout(() => {
          conn.close();
          peer.destroy();
          console.error("Peer error:", "Synchronization timeout");
          reject(new Error("Synchronization timeout"));
        }, 10000);

        conn.on("open", () => {
          clearTimeout(syncTimeout);
          const connection = new PlayerConnection(conn);
          connection.subscribe(onJoin);
          connection.join(player);

          resolve(id);
        });

        conn.on("error", (err) => {
          clearTimeout(connectionTimeout);
          setRoomPeer({
            id: peerCode,
            status: "error",
            connections: [],
          });
          console.error("Connection error:", err);
          reject(err);
        });

        conn.on("close", () => {
          clearTimeout(connectionTimeout);
          setRoomPeer({
            id: peerCode,
            status: "disconnected",
            connections: [],
          });
          console.error("Connection error:", "Connection closed by host");
          reject("Connection closed by host");
        });
      });

      peer.on("error", (err) => {
        clearTimeout(connectionTimeout);
        setRoomPeer({
          id: peerCode,
          status: "error",
          connections: [],
        });
        console.error("Peer error:", err);
        reject(err);
      });

      peer.on("disconnected", () => {
        clearTimeout(connectionTimeout);
        setRoomPeer({
          id: peerCode,
          status: "disconnected",
          connections: [],
        });
        peer.reconnect();
      });
    });
  };

  const sendToHost = async (message: P2PMessage): Promise<void> => {

  };

  const broadcast = async (message: P2PMessage): Promise<void> => {

  };

  return { roomPeer, createPeer, joinPeer, sendToHost, broadcast };
};
