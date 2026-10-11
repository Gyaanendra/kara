"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Sparkles,
  Send,
  Play,
  CheckCircle2,
  Cpu,
  Bot,
  User,
  ExternalLink,
} from "lucide-react";
import { fetchApi } from "../../lib/api";

interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  route?: string;
  citations?: Array<{
    meetingId: string;
    meetingTitle: string;
    timestampMs: number;
    quote: string;
  }>;
}

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

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "USER",
      content: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetchApi<any>("/ai/chat/ask", {
        method: "POST",
        body: JSON.stringify({ query: q }),
      });

      const assistantMsg: ChatMessage = {
        id: res.message?.id || `a_${Date.now()}`,
        role: "ASSISTANT",
        content: res.message?.content || "Answer processed.",
        route: res.route,
        citations: res.citations || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "ASSISTANT",
          content: `Error retrieving response: ${err.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-5xl mx-auto p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Kara AI Conversational Assistant
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Strict non-hallucinatory RAG over company history with Deepgram timestamp verification.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
          <Cpu className="w-3 h-3 text-purple-400" />
          <span>Laya Reflex (33ms) + Groq Reasoning</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m) => {
          const isUser = m.role === "USER";
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs space-y-2.5 shadow-sm leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
                }`}
              >
                {!isUser && m.route && (
                  <div className="flex items-center gap-1.5 text-[10px] text-purple-300 font-mono border-b border-zinc-800/80 pb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Laya Intent Route: {m.route}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Citations Pill Tray */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400 block">
                      Verified Citations & Audio Timestamps
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.citations.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 bg-zinc-950 border border-zinc-700/80 text-indigo-300 text-[10px] px-2 py-1 rounded-md font-mono"
                        >
                          <Play className="w-2.5 h-2.5 text-indigo-400" />
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
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center text-xs text-zinc-500">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <span>Kara is consulting verified records and routing via Laya...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Starters */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => handleSend("What decisions were finalized regarding our database migration?")}
          className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          What decisions were made on database migration?
        </button>
        <button
          onClick={() => handleSend("Summarize our pending action items and assignees.")}
          className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          Summarize pending action items and assignees
        </button>
        <button
          onClick={() => handleSend("Show high value deals currently in negotiation in CRM.")}
          className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          Show high value deals in CRM
        </button>
      </div>

      {/* Query Input */}
      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 focus-within:border-indigo-500 transition shadow-lg">
        <input
          type="text"
          placeholder="Ask Kara AI about meetings, commitments, tasks, or CRM..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          className="flex-1 bg-transparent px-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputQuery.trim()}
          className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
