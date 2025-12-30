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
  | "ROLL_UPDATE"
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

export class PeerPool {
  status: ConnectionStatus;
  private timeoutMs = 10000;

  constructor() {
    this.status = "created";
  }

  async open(
    code: string,
    onOpen?: (peer: Peer) => Promise<void> | void,
    onConnection?: (peer: Peer, connection: DataConnection) => void,
  ): Promise<Peer> {
    const id = generatePeerCode(code);
    return new Promise((resolve, reject) => {
      this.status = "connecting";
      const peer = new Peer(id, { debug: 3 });

      const connectionTimeout = setTimeout(() => {
        peer.destroy();
        reject(new Error("Peer error: Connection timeout"));
      }, this.timeoutMs);

      peer.on("open", async () => {
        clearTimeout(connectionTimeout);
        this.status = "connected";
        await onOpen?.(peer);

        resolve(peer);
      });

      peer.on("connection", (conn) => {
        onConnection?.(peer, conn);
      });

      peer.on("error", (err) => {
        clearTimeout(connectionTimeout);
        this.status = "error";
        reject(new Error(`Peer error: ${err.message}`));
      });

      peer.on("disconnected", () => {
        clearTimeout(connectionTimeout);
        this.status = "disconnected";
        peer.reconnect();
      });
    });
  }
}

export class PlayerPool {
  constructor() {}

  async open(
    code: string,
    peer: Peer,
    onOpen: (connection: DataConnection) => void,
  ): Promise<DataConnection> {
    const id = generatePeerCode(code);

    return new Promise((resolve, reject) => {
      const connection = peer.connect(id, { reliable: true });

      const syncTimeout = setTimeout(() => {
        connection.close();
        reject(new Error("Connection error: Synchronization timeout"));
      }, 10000);

      connection.on("open", () => {
        clearTimeout(syncTimeout);
        onOpen?.(connection);

        resolve(connection);
      });

      connection.on("error", (err) => {
        clearTimeout(syncTimeout);
        reject(new Error(`Connection error: ${err.message}`));
      });

      connection.on("close", () => {
        clearTimeout(syncTimeout);
        reject(new Error("Connection error: Connection closed by host"));
      });
    });
  }
}

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

  send(message: P2PMessage) {
    this.connection.send(message);
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

  send(message: P2PMessage) {
    this.connection.send(message);
  }

  join(player: Player) {
    const message = createMessage("JOIN", { player: player });
    this.connection.send(message);
  }
}

type ConnectionStatus =
  | "created"
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

type RoomPeer = {
  id: string;
  status: ConnectionStatus;
  connections: RoomConnection[];
  hostConnection?: PlayerConnection;
};

export const useRoomPeer = () => {
  const [roomPeer, setRoomPeer] = useState<RoomPeer>();
  const pool = new PeerPool();
  const playerPool = new PlayerPool();

  const roomPeerRef = useRef(roomPeer);
  useEffect(() => {
    roomPeerRef.current = roomPeer;
  }, [roomPeer]);

  const createPeer = async (
    roomCode: string,
    onJoin: (player: Player) => Room,
    onRollRequest: (playerId: string, diceType: DiceType) => Room,
  ): Promise<string> => {
    const connectionHandler = (peer: Peer, conn: DataConnection) => {
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
    };

    await pool.open(roomCode, () => undefined, connectionHandler);

    return roomCode;
  };

  const joinPeer = async (
    player: Player,
    roomCode: string,
    onJoin: (room: Room) => void,
  ): Promise<string> => {
    const openHandler = async (peer: Peer) => {
      const connectHandler = (conn: DataConnection) => {
        const connection = new PlayerConnection(conn);
        connection.subscribe(onJoin);
        connection.join(player);

        setRoomPeer((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            hostConnection: connection,
          };
        });
      };

      await playerPool.open(roomCode, peer, connectHandler);
    };

    await pool.open(player.id, openHandler);

    return player.id;
  };

  const sendToHost = async (message: P2PMessage): Promise<void> => {
    if (!roomPeer?.hostConnection) {
      throw new Error(`Failed to load Host info`);
    }

    roomPeer.hostConnection.send(message);
  };

  const broadcast = async (message: P2PMessage): Promise<void> => {
    if (!roomPeer) {
      throw new Error(`Failed to load Host info`);
    }

    roomPeer.connections.forEach((conn) => {
      conn.send(message);
    });
  };

  return { roomPeer, createPeer, joinPeer, sendToHost, broadcast };
};
