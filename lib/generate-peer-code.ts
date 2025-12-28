export function generatePeerCode(roomCode: string): string {
  const app = "roll-the-will";

  return `${app}-${roomCode}`
}
