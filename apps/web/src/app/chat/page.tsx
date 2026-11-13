"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Sparkles,
  Send,
  Play,
  Cpu,
  Bot,
  User,
  Paperclip,
  History,
} from "lucide-react";
import { fetchApi } from "../../lib/api";

interface Citation {
  meetingId: string;
  meetingTitle: string;
  timestampMs: number;
  quote: string;
}

interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  route?: string;
  citations?: Citation[];
}

interface AskResponse {
  message?: { id?: string; content?: string };
  route?: string;
  citations?: Citation[];
}

const promptStarters = [
  "What decisions were made on database migration?",
  "Summarize pending action items and assignees",
  "Show high value deals in CRM",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "ASSISTANT",
      content:
        "Hello Alex. I am Kara AI, your Chief of Staff. I operate under strict non-hallucinatory guardrails, answering questions strictly from verified meeting transcripts and PostgreSQL records. How can I assist you?",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: `u_${prev.length}`, role: "USER", content: q },
    ]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetchApi<AskResponse>("/ai/chat/ask", {
        method: "POST",
        body: JSON.stringify({ query: q }),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: res.message?.id || `a_${prev.length}`,
          role: "ASSISTANT",
          content: res.message?.content || "Answer processed.",
          route: res.route,
          citations: res.citations || [],
        },
      ]);
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${prev.length}`,
          role: "ASSISTANT",
          content: `Error retrieving response: ${detail}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
              Strict non-hallucinatory RAG with Deepgram timestamp verification.
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
            className="w-7 h-7 rounded-lg border border-line bg-card flex items-center justify-center text-ink-muted hover:text-ink hover:border-line-strong transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {messages.map((m) => {
          const isUser = m.role === "USER";
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center text-accent shrink-0 shadow-2xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs space-y-2.5 leading-relaxed font-albert ${
                  isUser
                    ? "bg-subtle border border-line text-ink rounded-tr-none"
                    : "bg-card border border-line text-ink-secondary rounded-tl-none shadow-2xs"
                }`}
              >
                {!isUser && m.route && (
                  <div className="flex items-center gap-1.5 text-[10px] text-accent font-mono border-b border-line pb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>Laya Intent Route: {m.route}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Citations Pill Tray */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-line space-y-1.5">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-ink-muted block">
                      Verified Citations &amp; Audio Timestamps
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.citations.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 bg-subtle border border-line text-accent text-[10px] px-2 py-1 rounded-md font-mono"
                        >
                          <Play className="w-2.5 h-2.5 shrink-0" />
                          <span>
                            {c.meetingTitle} @ {Math.round(c.timestampMs / 1000)}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-hovered border border-line flex items-center justify-center text-ink-secondary shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center text-xs text-ink-muted">
            <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center text-accent shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <span>Kara is consulting verified records and routing via Laya...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Starters */}
      <div className="flex flex-wrap gap-2 px-5 pb-2">
        {promptStarters.map((starter) => (
          <button
            key={starter}
            onClick={() => handleSend(starter)}
            className="text-[11px] font-albert bg-card hover:bg-hovered text-ink-secondary hover:text-ink border border-line px-3 py-1.5 rounded-lg transition-colors duration-200 ease-out cursor-pointer"
          >
            {starter}
          </button>
        ))}
      </div>

      {/* Centered Composer */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 bg-subtle border border-line rounded-xl p-2 focus-within:border-accent transition-colors shadow-2xs">
          <button
            type="button"
            title="Add attachment"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink transition cursor-pointer shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            placeholder="Ask Kara AI about meetings, commitments, tasks, or CRM..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 bg-transparent px-1 text-xs font-albert text-ink placeholder-ink-muted focus:outline-hidden"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputQuery.trim()}
            className="w-8 h-8 rounded-lg bg-accent text-on-accent hover:opacity-90 disabled:opacity-40 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
