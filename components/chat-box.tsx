"use client";

import { MessageSquare, Send } from "lucide-react";
import { RetroWindow } from "@/components/retro-window";
import { RetroTooltip } from "@/components/retro-tooltip";
import { ChatMessage } from "@/data/room-provider";
import { RetroInput } from "@/components/retro-input";
import { RetroButton } from "@/components/retro-button";
import { useState, useRef, useEffect } from "react";

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentPlayerId: string;
  className?: string;
}

export function ChatBox({
  messages = [],
  onSendMessage,
  currentPlayerId,
  className = "",
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <RetroWindow
      icon={
        <div className={"pixel-icon bg-background"}>
          <MessageSquare size={16} />
        </div>
      }
      title={"Chat"}
      className={`flex flex-col ${className}`}
    >
      <div className="flex flex-col h-[350px] gap-2">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3"
        >
          {messages.length === 0 ? (
            <p className="text-center text-sm p-2 dither opacity-50 flex-1 flex items-center justify-center">
              <span className="bg-background px-1">No messages yet</span>
            </p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.playerId === currentPlayerId;
              const date = new Date(msg.timestamp);
              const timeString = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              const fullTimeString = date.toLocaleString();

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    isMe ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <span className="text-[10px] font-bold px-1 mb-0.5 opacity-70">
                    {msg.playerName}
                  </span>
                  <div
                    className={`flex items-end gap-2 ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`border-2 px-2 py-1 text-sm break-all ${
                        isMe
                          ? "border-foreground bg-background text-right"
                          : "border-foreground bg-background"
                      }`}
                      style={{
                        boxShadow: "2px 2px 0px 0px currentColor",
                      }}
                    >
                      {msg.content}
                    </div>
                    <RetroTooltip
                      tooltip={
                        <span suppressHydrationWarning>{fullTimeString}</span>
                      }
                    >
                      <span
                        suppressHydrationWarning
                        className="text-[10px] opacity-50 cursor-help whitespace-nowrap mb-1"
                      >
                        {timeString}
                      </span>
                    </RetroTooltip>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="flex gap-2 pt-2 border-t-2 border-foreground/20">
          <RetroInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something..."
            className="flex-1 h-9"
          />
          <RetroButton
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-9 w-9 p-0 flex items-center justify-center"
          >
            <Send size={14} strokeWidth={3} />
          </RetroButton>
        </div>
      </div>
    </RetroWindow>
  );
}
