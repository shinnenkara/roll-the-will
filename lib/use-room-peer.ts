import Peer, { DataConnection } from "peerjs";
import { generatePeerId, getPlayerId } from "@/lib/generate-peer-id";
import { useEffect, useRef, useState } from "react";
import { Room } from "@/data/room-provider";
import { Player } from "@/data/player-provider";
import { DiceType } from "@/data/dices";

export type P2PMessageType =
  | "JOIN"
  | "INIT_SYNC"
  | "STATE_UPDATE"
  | "ROLL_REQUEST"
  | "MESSAGE_REQUEST"
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
    const id = generatePeerId(code);
    return new Promise((resolve, reject) => {
      this.status = "connecting";
      const peer = new Peer(id, { debug: 1 });

      const connectionTimeout = setTimeout(() => {
        peer.destroy();
        reject(new Error("Peer error: Connection timeout"));
      }, this.timeoutMs);

      peer.on("open", async () => {
        clearTimeout(connectionTimeout);
        this.status = "connected";

        try {
          await onOpen?.(peer);
          resolve(peer);
        } catch (error) {
          this.status = "error";
          peer.destroy();
          reject(error);
        }
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
    const id = generatePeerId(code);

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
    onMessageRequest: (playerId: string, content: string) => Room,
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
        case "MESSAGE_REQUEST": {
          const { playerId, content } = message.payload as {
            playerId: string;
            content: string;
          };
          const room = onMessageRequest(playerId, content);
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
    if (!this.connection.open) {
      return;
    }
    try {
      this.connection.send(message);
    } catch (e) {
      console.error("Failed to send message:", e);
    }
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
    if (!this.connection.open) {
      return;
    }
    try {
      this.connection.send(message);
    } catch (e) {
      console.error("Failed to send message:", e);
    }
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
  connections: Map<string, RoomConnection>;
  hostConnection?: PlayerConnection;
  peer?: Peer;
};

interface RoomPeerType {
  roomPeer: RoomPeer | undefined;
  createPeer: (
    roomCode: string,
    onJoin: (player: Player) => Room,
    onLeave: (playerId: string) => Room,
    onRollRequest: (playerId: string, diceType: DiceType) => Room,
    onMessageRequest: (playerId: string, content: string) => Room,
  ) => Promise<string>;
  joinPeer: (
    player: Player,
    roomCode: string,
    onJoin: (room: Room) => void,
    onHostDisconnect: () => void,
  ) => Promise<string>;
  sendToHost: (message: P2PMessage) => Promise<void>;
  broadcast: (message: P2PMessage) => Promise<void>;
  disconnect: () => void;
}

export const useRoomPeer = (): RoomPeerType => {
  const [roomPeer, setRoomPeer] = useState<RoomPeer>();
  const pool = new PeerPool();
  const playerPool = new PlayerPool();
  const isDestroyingRef = useRef(false);

  const roomPeerRef = useRef(roomPeer);
  useEffect(() => {
    roomPeerRef.current = roomPeer;
  }, [roomPeer]);

  const createPeer = async (
    roomCode: string,
    onJoin: (player: Player) => Room,
    onLeave: (playerId: string) => Room,
    onRollRequest: (playerId: string, diceType: DiceType) => Room,
    onMessageRequest: (playerId: string, content: string) => Room,
  ): Promise<string> => {
    isDestroyingRef.current = false;
    const openHandler = async (peer: Peer) => {
      setRoomPeer({
        id: roomCode,
        status: "connected",
        connections: new Map(),
        peer,
      });
    };

    const connectionHandler = (peer: Peer, conn: DataConnection) => {
      conn.on("open", () => {
        const connection = new RoomConnection(conn);

        const joinHandler = (player: Player) => {
          setRoomPeer((prev) => {
            if (!prev) return;

            const newConnections = new Map(prev.connections);
            newConnections.set(player.id, connection);

            return {
              ...prev,
              connections: newConnections,
            };
          });

          return onJoin(player);
        };

        connection.subscribe(joinHandler, onRollRequest, onMessageRequest);
      });

      const handleDisconnect = () => {
        if (isDestroyingRef.current) return;

        const playerId = getPlayerId(roomCode, conn.peer);

        setRoomPeer((prev) => {
          if (!prev) return;

          const newConnections = new Map(prev.connections);
          newConnections.delete(playerId);

          return {
            ...prev,
            connections: newConnections,
          };
        });

        onLeave(playerId);
      };

      conn.on("iceStateChanged", (state) => {
        switch (state) {
          case "closed":
          case "disconnected":
          case "failed":
            handleDisconnect();
            break;
        }
      });

      conn.on("error", (err) => {
        console.error("Player Connection Error:", err);
        handleDisconnect();
      });

      conn.on("close", () => {
        console.log("Player Connection Closed");
        handleDisconnect();
      });
    };

    await pool.open(roomCode, openHandler, connectionHandler);

    return roomCode;
  };

  const joinPeer = async (
    player: Player,
    roomCode: string,
    onJoin: (room: Room) => void,
    onHostDisconnect: () => void,
  ): Promise<string> => {
    isDestroyingRef.current = false;
    const id = `${roomCode}-${player.id}`;

    const openHandler = async (peer: Peer) => {
      const connectHandler = (conn: DataConnection) => {
        const connection = new PlayerConnection(conn);
        connection.subscribe(onJoin);
        connection.join(player);

        conn.on("close", () => {
          console.log("Host connection closed");
          onHostDisconnect();
        });

        conn.on("iceStateChanged", (state) => {
          switch (state) {
            case "failed":
            case "disconnected":
            case "closed":
              onHostDisconnect();
          }
        })

        conn.on("error", (err) => {
          console.error("Host connection error:", err);
          onHostDisconnect();
        });

        setRoomPeer({
          id: id,
          status: "connected",
          hostConnection: connection,
          connections: new Map(),
          peer,
        });
      };

      await playerPool.open(roomCode, peer, connectHandler);
    };

    await pool.open(id, openHandler);

    return id;
  };

  const sendToHost = async (message: P2PMessage): Promise<void> => {
    const roomPeerData = roomPeerRef.current;
    if (!roomPeerData?.hostConnection) {
      throw new Error(`Failed to load Host info`);
    }

    roomPeerData.hostConnection.send(message);
  };

  const broadcast = async (message: P2PMessage): Promise<void> => {
    const roomPeerData = roomPeerRef.current;
    if (!roomPeerData) {
      throw new Error(`Failed to load Host info`);
    }

    roomPeerData.connections.forEach((conn) => {
      conn.send(message);
    });
  };

  const disconnect = () => {
    isDestroyingRef.current = true;
    if (roomPeer?.peer) {
      roomPeer.peer.destroy();
    }
    setRoomPeer(undefined);
  };

  return { roomPeer, createPeer, joinPeer, sendToHost, broadcast, disconnect };
};
