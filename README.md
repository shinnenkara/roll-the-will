# Roll The Will

A retro-styled, peer-to-peer dice rolling application designed for tabletop RPG sessions. "Roll The Will" allows players to join rooms, chat, and roll dice in a shared environment without the need for a central game server, leveraging WebRTC via PeerJS.

**Live Demo:** [roll-the-will.vercel.app](https://roll-the-will.vercel.app/)

## Features

- **Retro Aesthetic**: Enjoy a nostalgic UI with dithering effects, pixelated fonts, and retro window styling.
- **Peer-to-Peer Connection**: Built on top of [PeerJS](https://peerjs.com/), ensuring low-latency communication directly between players.
- **Room Management**:
  - Create and host private rooms.
  - Join rooms via unique 6-character codes.
  - Host controls for managing the session.
- **Dice Tray**:
  - Support for standard RPG dice (d2, d4, d6, d8, d10, d12, d20, d100).
  - Real-time roll broadcasting to all players in the room.
  - **Cheat/Hidden Rolls**: Allow the Game Master (or sneaky players) to roll secretly.
- **Interactive Lobby**: Customizable player names and easy room navigation.
- **Live Chat**: Integrated chat box for in-game communication.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **P2P Networking**: [PeerJS](https://peerjs.com/)
- **UI Components**: Custom retro components (Radix UI primitives for accessibility).

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/roll-the-will.git
   cd roll-the-will
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Running the Development Server

Start the local development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How it Works

1. **Enter the Lobby**: Set your player name.
2. **Create a Room**: The host creates a room and receives a unique code.
3. **Share the Code**: The host shares the 6-character code with other players.
4. **Join**: Other players enter the code in the "Join Room" section to connect via WebRTC.
5. **Roll**: Click on dice in the tray to roll. Results appear instantly for everyone.

## License

[MIT](LICENSE)
