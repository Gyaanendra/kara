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

  if (!isAgentOpen) return null;

  const quickChips = [
    { label: "Decisions on DB migration?", icon: Database, color: "text-[#51557E] dark:text-[#A5C9CA]" },
    { label: "Summarize yesterday's standup", icon: Video, color: "text-[#816797] dark:text-[#D6D5A8]" },
    { label: "Show unassigned action items", icon: CheckSquare, color: "text-[#816797]" },
    { label: "Check Query Cloud SLA credit", icon: ShieldAlert, color: "text-[#51557E] dark:text-[#D6D5A8]" },
    { label: "Draft weekly executive MOM", icon: FileText, color: "text-[#51557E] dark:text-[#A5C9CA]" },
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
    <aside className="w-80 lg:w-88 shrink-0 h-full flex flex-col justify-between p-4 border-l border-slate-200 dark:border-[#51557E]/20 bg-white dark:bg-[#0B0E14] text-slate-800 dark:text-neutral-200 select-none overflow-hidden transition-colors duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#51557E]/20">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#816797] dark:text-[#D6D5A8]" />
          <span className="font-unbounded text-xs font-semibold text-[#1B2430] dark:text-white">
            Kara AI Chief
          </span>
          <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Mastra RAG
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Expand"
            className="p-1 rounded text-slate-400 hover:text-[#1B2430] dark:text-[#51557E] dark:hover:text-white transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleAgent}
            title="Close Assistant"
            className="p-1 rounded text-slate-400 hover:text-[#1B2430] dark:text-[#51557E] dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Conversation & Greeting */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5">
        {/* Assistant Greeting Banner */}
        <div className="text-center space-y-2.5 pt-2">
          <div className="w-10 h-10 rounded-full mx-auto bg-slate-100 dark:bg-[#1B2430] border border-slate-200 dark:border-[#D6D5A8]/40 flex items-center justify-center text-[#816797] dark:text-[#D6D5A8] shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-unbounded text-sm font-bold text-[#1B2430] dark:text-white">
              Autonomous Chief of Staff
            </h3>
            <p className="font-albert text-xs text-slate-500 dark:text-[#D6D5A8]/70 mt-0.5">
              Zero-hallucination answers across 15,612 meetings & contracts.
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#51557E]/30 bg-slate-50 dark:bg-[#1B2430]/60 hover:bg-slate-100 dark:hover:bg-[#1B2430] hover:border-[#816797]/60 text-[11px] font-albert text-slate-700 dark:text-neutral-300 hover:text-[#1B2430] dark:hover:text-white transition cursor-pointer active:scale-98"
              >
                <Icon className={clsx("w-3 h-3", chip.color)} />
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
                  ? "bg-[#816797]/15 dark:bg-[#816797]/30 border border-[#816797]/30 text-[#1B2430] dark:text-white ml-6 text-right"
                  : "bg-slate-100 dark:bg-[#1B2430] border border-slate-200 dark:border-[#51557E]/30 text-slate-800 dark:text-neutral-200 mr-4"
              )}
            >
              <p>{msg.text}</p>
              <span className="block text-[9px] font-mono text-slate-400 dark:text-[#51557E] mt-1">
                {msg.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Chat Input Form */}
      <form onSubmit={handleSend} className="pt-3 border-t border-slate-200 dark:border-[#51557E]/20">
        <div className="relative rounded-2xl bg-slate-50 dark:bg-[#131922] border border-slate-200 dark:border-[#51557E]/40 focus-within:border-[#816797] transition p-2 flex items-center justify-between gap-2 shadow-inner">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask Kara AI Chief of Staff..."
            className="flex-1 bg-transparent px-2 text-xs font-albert text-[#1B2430] dark:text-white placeholder-slate-400 dark:placeholder-[#51557E] focus:outline-hidden"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              title="Add attachment"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#1B2430] dark:text-[#51557E] dark:hover:text-white transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="submit"
              title="Query Kara AI"
              className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#51557E] to-[#816797] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer shadow-sm"
            >
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
}
