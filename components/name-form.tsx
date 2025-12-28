import { User } from "lucide-react";
import { RetroTooltip } from "@/components/retro-tooltip";
import { useState } from "react";
import { RetroButton } from "@/components/retro-button";
import { useRouter } from "next/navigation";
import { RetroInput } from "@/components/retro-input";
import { usePlayer } from "@/data/player-provider";

export function NameForm() {
  const { player, setPlayer } = usePlayer();
  const [playerName, setPlayerName] = useState<string>(player?.name ?? "");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName && playerName.trim()) {
      setPlayer({
        id: crypto.randomUUID(),
        name: playerName.trim(),
      });
      router.push("/lobby");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 text-xl">
        <RetroTooltip tooltip={"Player"}>
          <User />
        </RetroTooltip>
        <span>Enter Your Name</span>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <RetroInput
          placeholder={"Player Name"}
          name={"username"}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          autoFocus
          className={"w-full text-center"}
        />
        <RetroButton disabled={!playerName || !playerName.trim()}>
          [ ENTER ]
        </RetroButton>
      </form>
    </>
  );
}
