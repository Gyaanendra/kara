"use client";

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import {
  Sparkles,
  Send,
  Cpu,
  Bot,
  User,
  History,
  Clock,
  Layers,
  Loader2,
} from "lucide-react";
import { useWorkspaceStore } from "../../lib/store";

const promptStarters = [
  "What decisions were made on database migration?",
  "Summarize pending action items and assignees",
  "Show high value deals in CRM",
  "Evaluate candidate Vikram Joshi with 4 years experience in TypeScript",
];

export default function ChatPage() {
  const { chatMessages, sendLiveChatMessage, isChatLoading } = useWorkspaceStore();
  const [inputQuery, setInputQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isChatLoading) return;
    setInputQuery("");
    sendLiveChatMessage(q);
  };

  const formatOffset = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] min-h-[560px] max-w-4xl mx-auto w-full bg-card border border-line rounded-2xl shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-line bg-canvas/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="font-unbounded text-xs font-bold text-ink truncate">
              Kara AI Chief of Staff
            </h1>
            <p className="font-albert text-[10px] text-ink-muted truncate">
              Strict non-hallucinatory RAG with Deepgram timestamp verification &amp; dynamic Sub-Helpers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center gap-1.5 text-[10px] font-mono bg-accent-soft text-accent border border-accent/30 px-2 py-1 rounded-full">
            <Cpu className="w-3 h-3" />
            <span>Laya Reflex (33ms) + Groq 70B</span>
          </span>
          <button
            title="Session history"
            className="p-1.5 rounded-lg border border-line bg-card hover:bg-hovered text-ink-muted hover:text-ink transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "flex gap-3 max-w-2xl",
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {/* Avatar */}
            <div
              className={clsx(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs",
                msg.sender === "user"
                  ? "bg-accent text-on-accent"
                  : "bg-accent-soft border border-accent/30 text-accent"
              )}
            >
              {msg.sender === "user" ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={clsx(
                "p-3.5 rounded-2xl text-xs font-albert leading-relaxed border space-y-2",
                msg.sender === "user"
                  ? "bg-accent text-on-accent border-accent/40 rounded-tr-xs"
                  : "bg-subtle text-ink border-line rounded-tl-xs shadow-2xs"
              )}
            >
              {msg.isLoading ? (
                <div className="flex items-center gap-2 py-1 text-ink-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span className="font-mono text-[11px]">{msg.text}</span>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Sub-Helper badge if used */}
                  {msg.subHelper?.executed && (
                    <div className="flex items-center gap-1 text-[9px] font-mono text-accent bg-accent-soft px-2 py-0.5 rounded border border-accent/20 w-fit">
                      <Layers className="w-2.5 h-2.5" />
                      <span>Sub-Helper: {msg.subHelper.slug}</span>
                    </div>
                  )}

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-line/60 space-y-1">
                      <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider block">
                        Verified Meeting Citations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, i) => (
                          <span
                            key={i}
                            title={`"${c.quote}"`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-card border border-line text-[10px] font-mono text-ink-secondary hover:text-accent hover:border-accent/40 transition cursor-pointer"
                          >
                            <Clock className="w-3 h-3 text-accent" />
                            <span>
                              [{c.meetingTitle} @ {formatOffset(c.timestampMs)}]
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={clsx(
                      "block text-[9px] font-mono mt-1 text-right",
                      msg.sender === "user" ? "text-on-accent/70" : "text-ink-muted"
                    )}
                  >
                    {msg.timestamp}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Starters & Input Area */}
      <div className="p-4 border-t border-line bg-canvas/40 space-y-3">
        {/* Prompt starters */}
        <div className="flex flex-wrap gap-1.5">
          {promptStarters.map((starter, i) => (
            <button
              key={i}
              disabled={isChatLoading}
              onClick={() => handleSend(starter)}
              className="text-[11px] font-albert px-2.5 py-1 rounded-lg border border-line bg-card hover:bg-hovered hover:border-accent/40 text-ink-secondary hover:text-ink transition cursor-pointer disabled:opacity-50"
            >
              {starter}
            </button>
          ))}
        </div>

        {/* Form input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center rounded-xl bg-card border border-line focus-within:border-accent p-1.5 shadow-2xs transition"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isChatLoading}
            placeholder={
              isChatLoading
                ? "Kara AI is responding..."
                : "Ask Kara AI about meetings, commitments, tasks, candidates, or CRM..."
            }
            className="flex-1 bg-transparent px-3 py-1.5 text-xs font-albert text-ink placeholder-ink-muted focus:outline-hidden disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isChatLoading || !inputQuery.trim()}
            title="Send Message"
            className="w-7 h-7 rounded-lg bg-accent text-on-accent flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isChatLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
