import type React from "react";

export function ASCIITitle() {
  return (
    <div className="w-full max-w-[600px] mx-auto border-4 border-double border-foreground">
      <div className="flex items-center justify-center py-2 px-4 text-center">
        <h1 className="text-2xl uppercase">Roll The Will</h1>
      </div>
      <div className="border-t-4 border-double border-foreground flex justify-between items-center px-4 py-2 text-xs">
        <span>A multiplayer dice roller</span>
        <span>v1.0</span>
      </div>
    </div>
  );
}
