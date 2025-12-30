"use client";

import { RetroButton } from "@/components/retro-button";
import { RetroTooltip } from "@/components/retro-tooltip";
import { RetroWindow } from "@/components/retro-window";
import { dices, DiceType } from "@/data/dices";
import { Wand } from "lucide-react";
import { useState } from "react";
import { RetroDialog } from "@/components/retro-dialog";
import { Input } from "@/components/ui/input";
import { RetroInput } from "@/components/retro-input";

interface DiceIconProps {
  type: DiceType;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}

export function DiceIcon({ type, onClick, disabled, active }: DiceIconProps) {
  const dice = dices[type];

  return (
    <RetroTooltip tooltip={dice.label}>
      <RetroButton
        size={"icon-xl"}
        onClick={onClick}
        disabled={disabled}
        className={active ? "bg-foreground text-background" : ""}
      >
        <div className={"p-0.5"}>{dice.shape()}</div>
      </RetroButton>
    </RetroTooltip>
  );
}

export function DiceTray({
  onRoll,
  disabled,
  isMaster,
  onCheatRoll,
}: {
  onRoll: (type: DiceType) => void;
  disabled?: boolean;
  isMaster?: boolean;
  onCheatRoll?: (type: DiceType, value: number) => void;
}) {
  const diceTypes: DiceType[] = ["d4", "d6", "d8", "d10", "d12", "d20"];
  const [isCheatOpen, setIsCheatOpen] = useState(false);
  const [selectedCheatDice, setSelectedCheatDice] = useState<DiceType>("d20");
  const [cheatValue, setCheatValue] = useState<string>("");

  const handleCheatSubmit = () => {
    const value = parseInt(cheatValue);
    if (isNaN(value) || !onCheatRoll) return;

    const max = dices[selectedCheatDice].maxValue;
    const clampedValue = Math.min(Math.max(value, 1), max);

    onCheatRoll(selectedCheatDice, clampedValue);
    setIsCheatOpen(false);
    setCheatValue("");
  };

  return (
    <RetroWindow title={"Dice Tray"}>
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {diceTypes.map((type) => (
          <DiceIcon
            key={type}
            type={type}
            onClick={() => onRoll(type)}
            disabled={disabled}
          />
        ))}
        {isMaster && (
          <div className="ml-2 pl-2 border-l-2 border-foreground/20">
            <RetroTooltip tooltip={"Magic Roll (Master Only)"}>
              <RetroButton
                size={"icon-xl"}
                onClick={() => setIsCheatOpen(true)}
                disabled={disabled}
              >
                <div className={"pixel-icon h-full w-full flex items-center justify-center p-3"}>
                  <Wand className="size-full" />
                </div>
              </RetroButton>
            </RetroTooltip>
          </div>
        )}
      </div>

      {isCheatOpen && (
        <RetroDialog
          title="Magic Roll"
          onClose={() => setIsCheatOpen(false)}
          initialOpen={true}
          footer={(close) => (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <RetroButton onClick={close}>[ Cancel ]</RetroButton>
              <RetroButton onClick={handleCheatSubmit}>
                [ Cast Spell ]
              </RetroButton>
            </div>
          )}
        >
          <div className="flex flex-col gap-6 p-4 items-center">
            <div className="flex flex-col gap-2 items-center">
              <p className="text-sm font-bold">Select Dice Type:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {diceTypes.map((type) => (
                  <DiceIcon
                    key={type}
                    type={type}
                    onClick={() => setSelectedCheatDice(type)}
                    active={selectedCheatDice === type}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center w-full max-w-[200px]">
              <p className="text-sm font-bold">
                Value (1-{dices[selectedCheatDice].maxValue}):
              </p>
              <RetroInput
                type="number"
                min={1}
                max={dices[selectedCheatDice].maxValue}
                value={cheatValue}
                onChange={(e) => setCheatValue(e.target.value)}
                className="text-center text-lg"
                placeholder="?"
              />
            </div>
          </div>
        </RetroDialog>
      )}
    </RetroWindow>
  );
}
