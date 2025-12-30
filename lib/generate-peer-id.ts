const app = "roll-the-will";

export function generatePeerId(id: string): string {
  return `${app}-${id}`
}

export function getOriginalId(peerId: string): string {
  return peerId.replace(`${app}-`, "");
}

export function getPlayerId(roomCode: string, peerId: string): string {
  const roomId = getOriginalId(peerId);
  return roomId.replace(`${roomCode}-`, "");
}
