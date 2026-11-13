"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Loader2,
  Clock,
  Layers,
} from "lucide-react";
import { useWorkspaceStore } from "../../lib/store";

export function AgentPanel() {
  const {
    isAgentOpen,
    toggleAgent,
    chatMessages,
    sendLiveChatMessage,
    isChatLoading,
  } = useWorkspaceStore();

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickChips = [
    { label: "Decisions on DB migration?", icon: Database },
    { label: "Summarize yesterday's standup", icon: Video },
    { label: "Show unassigned action items", icon: CheckSquare },
    { label: "Check Query Cloud SLA credit", icon: ShieldAlert },
    { label: "Draft weekly executive MOM", icon: FileText },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isChatLoading) return;
    const text = inputVal.trim();
    setInputVal("");
    sendLiveChatMessage(text);
  };

  const handleChipClick = (label: string) => {
    if (isChatLoading) return;
    sendLiveChatMessage(label);
  };

  const formatOffset = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <aside
      aria-hidden={!isAgentOpen}
      className={clsx(
        "w-80 lg:w-92 shrink-0 h-full flex flex-col justify-between p-4 border-l border-line bg-card text-ink select-none transition-colors duration-200",
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
          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20">
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
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Assistant Greeting Banner */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-9 h-9 rounded-full mx-auto bg-accent-soft border border-accent/30 flex items-center justify-center text-accent shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-unbounded text-xs font-bold text-ink">
              Kara AI Chief of Staff
            </h3>
            <p className="font-albert text-[11px] text-ink-muted mt-0.5">
              Strictly grounded in verified PostgreSQL 18 transcripts &amp; CRM.
            </p>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap gap-1.5 justify-center pt-1 pb-2 border-b border-line/60">
          {quickChips.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                disabled={isChatLoading}
                onClick={() => handleChipClick(chip.label)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-line bg-subtle hover:bg-hovered hover:border-accent/40 text-[11px] font-albert text-ink-secondary hover:text-ink transition-all duration-150 ease-out cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-accent" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conversation Stream */}
        <div className="space-y-3 pt-1">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "p-3 rounded-xl text-xs font-albert leading-relaxed transition-all",
                msg.sender === "user"
                  ? "bg-accent-soft border border-accent/25 text-ink ml-6 text-right"
                  : "bg-subtle border border-line text-ink-secondary mr-2"
              )}
            >
              {/* Loading State Animation */}
              {msg.isLoading ? (
                <div className="flex items-center gap-2 py-1 text-ink-muted">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span className="font-mono text-[10px]">{msg.text}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Sub-Helper telemetry tag if executed */}
                  {msg.subHelper?.executed && (
                    <div className="flex items-center gap-1 text-[9px] font-mono text-accent bg-accent-soft/60 px-2 py-0.5 rounded border border-accent/20 w-fit">
                      <Layers className="w-2.5 h-2.5" />
                      <span>Sub-Helper: {msg.subHelper.slug}</span>
                    </div>
                  )}

                  {/* Verified Ground-Truth Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-1.5 border-t border-line/60 space-y-1">
                      <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider block">
                        Verified Citations:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.citations.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-card border border-line text-[10px] font-mono text-ink-secondary hover:text-accent hover:border-accent/40 transition cursor-pointer"
                            title={`"${c.quote}"`}
                          >
                            <Clock className="w-2.5 h-2.5 text-accent" />
                            <span>
                              [{c.meetingTitle} @ {formatOffset(c.timestampMs)}]
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="block text-[9px] font-mono text-ink-muted mt-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Chat Input Form */}
      <form onSubmit={handleSend} className="pt-3 border-t border-line">
        <div className="relative rounded-2xl bg-subtle border border-line focus-within:border-accent transition-colors p-2 flex items-center justify-between gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isChatLoading}
            placeholder={
              isChatLoading
                ? "Kara AI is responding..."
                : "Ask Kara AI Chief of Staff..."
            }
            className="flex-1 bg-transparent px-2 text-xs font-albert text-ink placeholder-ink-muted focus:outline-hidden disabled:opacity-50"
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
              disabled={isChatLoading || !inputVal.trim()}
              title="Query Kara AI"
              className="w-7 h-7 rounded-lg bg-accent text-on-accent flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isChatLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
}
