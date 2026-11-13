"use client";

import React, { useState } from "react";
import clsx from "clsx";
import {
  Sparkles,
  X,
  Maximize2,
  Video,
  CheckSquare,
  Database,
  ArrowUp,
  Bot,
  Plus,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { useWorkspaceStore } from "../../lib/store";

export function AgentPanel() {
  const { isAgentOpen, toggleAgent, chatMessages, sendChatMessage } =
    useWorkspaceStore();
  const [inputVal, setInputVal] = useState("");

  const quickChips = [
    { label: "Decisions on DB migration?", icon: Database },
    { label: "Summarize yesterday's standup", icon: Video },
    { label: "Show unassigned action items", icon: CheckSquare },
    { label: "Check Query Cloud SLA credit", icon: ShieldAlert },
    { label: "Draft weekly executive MOM", icon: FileText },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendChatMessage(inputVal.trim());
    setInputVal("");
  };

  const handleChipClick = (label: string) => {
    sendChatMessage(label);
  };

  return (
    <aside
      aria-hidden={!isAgentOpen}
      className={clsx(
        "w-80 lg:w-88 shrink-0 h-full flex flex-col justify-between p-4 border-l border-line bg-card text-ink select-none transition-colors duration-200",
        isAgentOpen ? "drawer-enter" : "drawer-exit pointer-events-none"
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-accent" />
          <span className="font-unbounded text-xs font-semibold text-ink">
            Kara AI Chief of Staff
          </span>
          <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-success/10 text-success border border-success/20">
            Mastra RAG
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Expand"
            className="p-1 rounded text-ink-muted hover:text-ink transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleAgent}
            title="Close Assistant"
            className="p-1 rounded text-ink-muted hover:text-ink transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Conversation & Greeting */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5">
        {/* Assistant Greeting Banner */}
        <div className="text-center space-y-2.5 pt-2">
          <div className="w-10 h-10 rounded-full mx-auto bg-accent-soft border border-accent/30 flex items-center justify-center text-accent shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-unbounded text-sm font-bold text-ink">
              Kara AI Chief of Staff
            </h3>
            <p className="font-albert text-xs text-ink-muted mt-0.5">
              Zero-hallucination answers across 15,612 meetings &amp; contracts.
            </p>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap gap-1.5 justify-center pt-1">
          {quickChips.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.label)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line bg-subtle hover:bg-hovered hover:border-accent/40 text-[11px] font-albert text-ink-secondary hover:text-ink transition-all duration-200 ease-out cursor-pointer active:scale-98"
              >
                <Icon className="w-3 h-3 text-accent" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conversation Stream */}
        <div className="space-y-3 pt-2">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "p-3 rounded-xl text-xs font-albert leading-relaxed",
                msg.sender === "user"
                  ? "bg-accent-soft border border-accent/25 text-ink ml-6 text-right"
                  : "bg-subtle border border-line text-ink-secondary mr-4"
              )}
            >
              <p>{msg.text}</p>
              <span className="block text-[9px] font-mono text-ink-muted mt-1">
                {msg.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Chat Input Form */}
      <form onSubmit={handleSend} className="pt-3 border-t border-line">
        <div className="relative rounded-2xl bg-subtle border border-line focus-within:border-accent transition-colors p-2 flex items-center justify-between gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask Kara AI Chief of Staff..."
            className="flex-1 bg-transparent px-2 text-xs font-albert text-ink placeholder-ink-muted focus:outline-hidden"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              title="Add attachment"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="submit"
              title="Query Kara AI"
              className="w-7 h-7 rounded-lg bg-accent text-on-accent flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer shadow-sm"
            >
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
}
