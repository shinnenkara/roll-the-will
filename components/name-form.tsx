import { User } from "lucide-react";
import { RetroTooltip } from "@/components/retro-tooltip";
import { useState } from "react";
import { RetroButton } from "@/components/retro-button";
import { useRouter } from "next/navigation";
import { RetroInput } from "@/components/retro-input";
import { usePlayer } from "@/components/player-provider";

export function NameForm() {
  const [playerName, setPlayerName] = useState<string>("");
  const router = useRouter();
  const { setPlayer } = usePlayer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName && playerName.trim()) {
      setPlayer({
        id: crypto.randomUUID(),
        name: playerName.trim(),
      });
      await router.push("/lobby");
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
