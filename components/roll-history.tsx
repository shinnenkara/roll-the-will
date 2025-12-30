"use client";

import { History } from "lucide-react";
import { RetroWindow } from "@/components/retro-window";
import { RollResult } from "@/data/room-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RetroTooltip } from "@/components/retro-tooltip";

interface RollHistoryProps {
  rolls: RollResult[];
  currentPlayerId: string;
  masterId: string;
}

export function RollHistory({
  rolls,
  currentPlayerId,
  masterId,
}: RollHistoryProps) {
  const isViewerMaster = currentPlayerId === masterId;
  const visibleRolls = rolls.filter(
    (roll) => !roll.isHidden || isViewerMaster || roll.playerId === currentPlayerId,
  );
  return (
    <RetroWindow
      icon={
        <div className={"pixel-icon bg-background"}>
          <History size={16} />
        </div>
      }
      title={"History"}
    >
      <div className="max-h-[200px] overflow-y-auto">
        {visibleRolls.length === 0 ? (
          <p className="text-center text-sm p-2 dither">
            <span className="bg-background px-1">No rolls yet</span>
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-black">
                <TableHead className="h-8 font-bold text-foreground">
                  Player
                </TableHead>
                <TableHead className="h-8 font-bold text-foreground text-center">
                  Dice
                </TableHead>
                <TableHead className="h-8 font-bold text-foreground text-right">
                  Result
                </TableHead>
                <TableHead className="h-8 font-bold text-foreground text-right w-[60px]">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRolls.map((roll) => {
                const date = new Date(roll.timestamp);
                const timeString = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
                const fullTimeString = date.toLocaleString();

                return (
                  <TableRow
                    key={roll.id}
                    className="border-black hover:bg-black/5"
                  >
                    <TableCell className="py-1 font-medium truncate max-w-[100px]">
                      {roll.playerName}
                    </TableCell>
                    <TableCell className="py-1 text-center uppercase">
                      {roll.diceType}
                    </TableCell>
                    <TableCell className="py-1 text-right font-bold">
                      {roll.result}
                      {roll.isHidden && (
                        <span className="text-[10px] opacity-50 ml-1 block leading-none">
                          (Hidden)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-1 text-right">
                      <RetroTooltip
                        tooltip={
                          <span suppressHydrationWarning>{fullTimeString}</span>
                        }
                      >
                        <span
                          suppressHydrationWarning
                          className="text-xs opacity-50 cursor-help whitespace-nowrap"
                        >
                          {timeString}
                        </span>
                      </RetroTooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </RetroWindow>
  );
}
