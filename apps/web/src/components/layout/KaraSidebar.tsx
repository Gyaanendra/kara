"use client";

import React, { useState } from "react";
import clsx from "clsx";
import {
  Sparkles,
  Video,
  KanbanSquare,
  Database,
  Radio,
  FileText,
  Activity,
  Layers,
  Clock,
  ShieldCheck,
  Cpu,
  Server,
  Settings,
  HelpCircle,
  ChevronsUpDown,
  LayoutDashboard,
  Bell,
  CheckCircle2,
  Calendar,
  Flame,
} from "lucide-react";
import { useWorkspaceStore } from "../../lib/store";

export function KaraSidebar() {
  const { activeNav, setActiveNav, isSidebarOpen, setActiveModule } =
    useWorkspaceStore();

  const executiveItems = [
    { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
    { id: "chat", label: "Chief of Staff RAG", icon: Sparkles, badge: "AI" },
    { id: "moms", label: "Minutes of Meeting", icon: FileText },
  ];

  const botItems = [
    { id: "meetings", label: "Live Bot Ingestion", icon: Video, pulse: true },
    { id: "transcripts", label: "Deepgram Diarization", icon: Radio },
    { id: "recordings", label: "RustFS S3 Audio", icon: Layers },
  ];

  const intelligenceItems = [
    { id: "tasks", label: "Notion Kanban Task OS", icon: KanbanSquare, count: 142 },
    { id: "contracts", label: "Twenty CRM Engine", icon: Database, count: 49 },
    { id: "alerts", label: "Decision Alerts", icon: Bell, count: 7 },
  ];

  const telemetryItems = [
    { id: "telemetry", label: "Laya Reflex (33ms)", icon: Cpu },
    { id: "cron", label: "PostgreSQL 18 MVCC", icon: Server },
  ];

  if (!isSidebarOpen) return null;

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    if (id === "overview") setActiveModule("overview");
    else if (id === "meetings") setActiveModule("meetings");
    else if (id === "tasks") setActiveModule("tasks");
    else if (id === "contracts") setActiveModule("contracts");
    else if (id === "alerts") setActiveModule("alerts");
    else if (id === "chat") setActiveModule("chat");
  };

  return (
    <aside className="w-60 lg:w-64 shrink-0 h-full flex flex-col justify-between py-4 px-3 border-r border-slate-200 dark:border-[#51557E]/20 bg-white dark:bg-[#0B0E14] text-slate-700 dark:text-neutral-300 select-none overflow-y-auto transition-colors duration-200">
      <div className="space-y-5">
        {/* Workspace Brand Dropdown */}
        <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1B2430]/80 border border-slate-200 dark:border-[#51557E]/30 cursor-pointer hover:border-[#816797]/50 transition shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#816797] to-[#51557E] flex items-center justify-center text-white font-unbounded text-xs font-bold shadow-sm">
              K
            </div>
            <div className="flex flex-col">
              <span className="font-unbounded text-xs font-bold tracking-tight text-[#1B2430] dark:text-white flex items-center gap-1.5">
                Kara AI
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-medium bg-[#816797]/20 text-[#816797] dark:text-[#D6D5A8] border border-[#816797]/30">
                  OS
                </span>
              </span>
              <span className="font-albert text-[10px] text-slate-400 dark:text-[#51557E] truncate">
                Chief of Staff Engine
              </span>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#51557E]" />
        </div>

        {/* Executive Section */}
        <div className="space-y-1">
          <span className="px-2.5 text-[10px] font-unbounded font-semibold tracking-wider text-slate-400 dark:text-[#51557E] uppercase">
            Executive Intelligence
          </span>
          <div className="space-y-0.5">
            {executiveItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={clsx(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-albert transition cursor-pointer",
                    isActive
                      ? "bg-slate-100 text-[#1B2430] border border-slate-300/80 dark:bg-[#1B2430] dark:text-white dark:border-[#51557E]/50 font-medium shadow-2xs"
                      : "text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={clsx(
                        "w-4 h-4",
                        isActive
                          ? "text-[#816797] dark:text-[#D6D5A8]"
                          : "text-slate-400 dark:text-[#51557E]"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#816797] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meeting Bot Section */}
        <div className="space-y-1">
          <span className="px-2.5 text-[10px] font-unbounded font-semibold tracking-wider text-slate-400 dark:text-[#51557E] uppercase">
            Meeting Bot & Audio
          </span>
          <div className="space-y-0.5">
            {botItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={clsx(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-albert transition cursor-pointer",
                    isActive
                      ? "bg-slate-100 text-[#1B2430] border border-slate-300/80 dark:bg-[#1B2430] dark:text-white dark:border-[#51557E]/50 font-medium"
                      : "text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={clsx(
                        "w-4 h-4",
                        isActive
                          ? "text-[#816797]"
                          : "text-slate-400 dark:text-[#51557E]"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.pulse && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Intelligence OS Section */}
        <div className="space-y-1">
          <span className="px-2.5 text-[10px] font-unbounded font-semibold tracking-wider text-slate-400 dark:text-[#51557E] uppercase">
            Workspace Intelligence
          </span>
          <div className="space-y-0.5">
            {intelligenceItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={clsx(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-albert transition cursor-pointer",
                    isActive
                      ? "bg-slate-100 text-[#1B2430] border border-slate-300/80 dark:bg-[#1B2430] dark:text-white dark:border-[#51557E]/50 font-medium"
                      : "text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={clsx(
                        "w-4 h-4",
                        isActive
                          ? "text-[#816797] dark:text-[#D6D5A8]"
                          : "text-slate-400 dark:text-[#51557E]"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.count && (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-[#51557E]">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Telemetry Group */}
        <div className="space-y-1">
          <span className="px-2.5 text-[10px] font-unbounded font-semibold tracking-wider text-slate-400 dark:text-[#51557E] uppercase">
            Telemetry & Storage
          </span>
          <div className="space-y-0.5">
            {telemetryItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-albert text-slate-500 dark:text-neutral-400"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-[#51557E]" />
                    <span className="text-[11px]">{item.label}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings / Executive Badge */}
      <div className="pt-4 border-t border-slate-200 dark:border-[#51557E]/20 space-y-3">
        <div className="space-y-0.5">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-albert text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40 transition cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-[#51557E]" />
            <span>Architecture & Docs</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-albert text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40 transition cursor-pointer">
            <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-[#51557E]" />
            <span>Settings</span>
          </button>
        </div>

        {/* Enterprise Executive Badge */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-[#1B2430]/90 border border-slate-200 dark:border-[#51557E]/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#D6D5A8] flex items-center justify-center text-[#1B2430] font-unbounded text-[10px] font-bold">
              ✦
            </div>
            <div className="flex flex-col">
              <span className="font-albert text-xs font-semibold text-[#1B2430] dark:text-white">
                Acme Enterprise
              </span>
              <span className="font-mono text-[9px] text-slate-400 dark:text-[#51557E]">
                org_76a82f10...
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-unbounded font-semibold bg-[#816797] text-white">
            Chief OS
          </span>
        </div>
      </div>
    </aside>
  );
}

