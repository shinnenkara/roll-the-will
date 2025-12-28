"use client";

import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export function LoadingScreen({
  message = "Please wait",
  submessage,
}: LoadingScreenProps) {
  const [frame, setFrame] = useState(0);
  const maxFrame = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % maxFrame);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={"min-h-screen flex items-center justify-center"}>
      <div className="retro-window bg-background w-full max-w-sm">
        <div className="p-8 flex flex-col items-center gap-6">
          <div
            className="pixel-icon transition-none"
            style={{
              transform: frame === 1 ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <Hourglass size={48} />
          </div>

          <div className="text-center">
            <p className="text-2xl stutter-animation">{message}</p>
            {submessage && (
              <p className="text-lg mt-2 dither inline-block">
                <span className="bg-background px-2">{submessage}</span>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 border-2 border-foreground ${frame % 3 === i ? "bg-foreground" : "bg-background"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
