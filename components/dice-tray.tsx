"use client";

import { RetroButton } from "@/components/retro-button";
import { RetroTooltip } from "@/components/retro-tooltip";
import { RetroWindow } from "@/components/retro-window";
import { dices, DiceType } from "@/data/dices";

interface DiceIconProps {
  type: DiceType;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}

export function DiceIcon({ type, onClick, disabled }: DiceIconProps) {
  const dice = dices[type];

  return (
    <RetroTooltip tooltip={dice.label}>
      <RetroButton size={"icon-xl"} onClick={onClick} disabled={disabled}>
        <div className={"p-0.5"}>{dice.shape}</div>
      </RetroButton>
    </RetroTooltip>
  );
}

export function DiceTray({
  onRoll,
  disabled,
}: {
  onRoll: (type: DiceType) => void;
  disabled?: boolean;
}) {
  const diceTypes: DiceType[] = ["d4", "d6", "d8", "d10", "d12", "d20"];

  return (
    <RetroWindow title={"Dice Tray"}>
      <div className="flex flex-wrap gap-2 justify-center">
        {diceTypes.map((type) => (
          <DiceIcon
            key={type}
            type={type}
            onClick={() => onRoll(type)}
            disabled={disabled}
          />
        ))}
      </div>
    </RetroWindow>
  );
}
