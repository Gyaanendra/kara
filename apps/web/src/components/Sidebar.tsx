"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  KanbanSquare,
  Database,
  Sparkles,
  Server,
  Activity,
  Layers,
  Cpu,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Meetings Hub", href: "/meetings", icon: Video },
    { label: "Kanban Tasks", href: "/tasks", icon: KanbanSquare },
    { label: "Twenty CRM", href: "/crm", icon: Database },
    { label: "Kara AI Chat", href: "/chat", icon: Sparkles },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between p-4 select-none shrink-0 text-zinc-300">
      <div className="space-y-6">
        {/* Workspace Brand / Header */}
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-zinc-900/60 cursor-pointer transition">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
            K
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
              Kara AI <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 rounded font-mono">OS</span>
            </span>
            <span className="text-xs text-zinc-500">Acme Corporation</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-800/80 text-white shadow-sm border border-zinc-700/50"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-zinc-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Live System Telemetry */}
      <div className="pt-4 border-t border-zinc-800/80 space-y-2">
        <div className="px-2 text-[10px] font-semibold tracking-wider uppercase text-zinc-500 flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>System Telemetry</span>
        </div>
        <div className="space-y-1.5 text-[11px] px-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Server className="w-3 h-3 text-cyan-400" /> PostgreSQL 18
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">MVCC Online</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-amber-400" /> Deepgram STT
            </span>
            <span className="text-zinc-300 font-mono text-[10px]">Nova-3 Multilingual</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Groq Reasoning
            </span>
            <span className="text-zinc-300 font-mono text-[10px]">Llama 3.3 70B</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-purple-400" /> Laya Reflex
            </span>
            <span className="text-purple-300 font-mono text-[10px]">33ms Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
