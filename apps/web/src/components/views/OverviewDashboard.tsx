"use client";

import React, { useState } from "react";
import clsx from "clsx";
import {
  Video,
  TrendingUp,
  Search,
  Bell,
  Settings,
  Sun,
  Moon,
  Bot,
  GitBranch,
  Radio,
  Cpu,
  Layers,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Play,
} from "lucide-react";
import { useWorkspaceStore } from "../../lib/store";

export function OverviewDashboard() {
  const {
    theme,
    toggleTheme,
    isAgentOpen,
    toggleAgent,
    chartMetric,
    setChartMetric,
    setActiveModule,
  } = useWorkspaceStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Exact 40-column matrix block histogram data matching Image 1
  const matrixColumns = [
    { height: 2 }, { height: 3 }, { height: 4 }, { height: 3 },
    { height: 2 }, { height: 5 }, { height: 7 }, { height: 11 },
    { height: 13 }, { height: 12 }, { height: 8 }, { height: 6 },
    { height: 4 }, { height: 3 }, { height: 2 }, { height: 4 },
    { height: 6 }, { height: 9 }, { height: 8 }, { height: 7 },
    { height: 5 }, { height: 4 }, { height: 3 }, { height: 5 },
    { height: 7 }, { height: 11 }, { height: 14 }, { height: 10 },
    { height: 8 }, { height: 9 }, { height: 7 }, { height: 8 },
    { height: 7 }, { height: 6 }, { height: 5 }, { height: 4 },
    { height: 5 }, { height: 7 }, { height: 6 }, { height: 3 },
  ];

  const liveMeetings = [
    {
      id: "meet-1",
      title: "Q3 Architecture & Database Standup",
      platform: "Google Meet",
      status: "Live Recording",
      duration: "00:24:12",
      speakerTurns: 48,
      statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      id: "meet-2",
      title: "Enterprise Deal Review — Query Cloud",
      platform: "Zoom",
      status: "MOM Synthesis",
      duration: "00:45:00",
      speakerTurns: 92,
      statusColor: "text-[#816797] bg-[#816797]/15 border-[#816797]/30",
    },
    {
      id: "meet-3",
      title: "Customer Security & Compliance Audit",
      platform: "MS Teams",
      status: "Completed",
      duration: "00:32:15",
      speakerTurns: 64,
      statusColor: "text-[#D6D5A8] bg-[#D6D5A8]/10 border-[#D6D5A8]/30",
    },
  ];

  const attributionRows = [
    {
      id: "attr-1",
      name: "Q3 Architecture & Database Standup",
      platform: "Google Meet",
      status: "MOM Synthesized",
      statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      tasks: "6 tasks in Kanban",
      owner: "Alex Chen (Engineering)",
      impact: "$450,000",
    },
    {
      id: "attr-2",
      name: "Enterprise Deal Review — Query Cloud",
      platform: "Zoom",
      status: "Twenty CRM Synced",
      statusColor: "bg-[#816797]/15 text-[#816797] dark:text-[#D6D5A8] border-[#816797]/30",
      tasks: "4 obligations created",
      owner: "Helena Derwent (Finance)",
      impact: "$125,000",
    },
    {
      id: "attr-3",
      name: "Customer SLA & Price Cap Audit",
      platform: "Google Meet",
      status: "Diarization Complete",
      statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      tasks: "2 price caps checked",
      owner: "Subash K. (Security)",
      impact: "$56,900",
    },
    {
      id: "attr-4",
      name: "Weekly Executive Standup — Growth",
      platform: "MS Teams",
      status: "Action Items Assigned",
      statusColor: "bg-[#816797]/15 text-[#816797] dark:text-[#D6D5A8] border-[#816797]/30",
      tasks: "8 tasks in Kanban",
      owner: "Sarah Jenkins (Procurement)",
      impact: "$148,000",
    },
  ];

  const handleSync = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#51557E]/20 select-none">
        {/* Left Breadcrumb & Search */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-albert text-slate-500 dark:text-[#D6D5A8]/70">
            <span className="hover:text-[#1B2430] dark:hover:text-white transition cursor-pointer">
              Kara AI OS
            </span>
            <span>•</span>
            <span className="font-semibold text-[#1B2430] dark:text-white">
              Chief of Staff Overview
            </span>
          </div>

          <div className="relative flex items-center rounded-lg bg-white dark:bg-[#131922] border border-slate-200 dark:border-[#51557E]/30 px-2.5 py-1 text-xs shadow-2xs">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#51557E] mr-1.5" />
            <input
              type="text"
              placeholder="Search meetings, decisions, deals, action items..."
              className="bg-transparent text-xs font-albert text-[#1B2430] dark:text-white placeholder-slate-400 dark:placeholder-[#51557E] focus:outline-hidden w-48 lg:w-72"
            />
            <kbd className="text-[10px] font-mono text-slate-400 dark:text-[#51557E] ml-2">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Action Icons & Theme Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            title="Sync Workspace"
            className="flex items-center gap-1.5 text-xs font-albert text-slate-500 hover:text-[#1B2430] dark:text-[#51557E] dark:hover:text-[#D6D5A8] transition cursor-pointer hidden sm:inline-flex"
          >
            <RefreshCw
              className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin")}
            />
            <span>{isRefreshing ? "Syncing..." : "Sync Workspace"}</span>
          </button>

          <button
            title="Notifications"
            className="relative p-1.5 rounded-lg text-slate-400 hover:text-[#1B2430] dark:text-[#51557E] dark:hover:text-white transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>

          <button
            title="Settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#1B2430] dark:text-[#51557E] dark:hover:text-white transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Proper Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            className="p-1.5 rounded-lg bg-white dark:bg-[#1B2430] border border-slate-200 dark:border-[#51557E]/40 text-[#816797] dark:text-[#D6D5A8] shadow-xs hover:border-[#816797] transition cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#D6D5A8]" />
            ) : (
              <Moon className="w-4 h-4 text-[#816797]" />
            )}
          </button>

          {/* Toggle Agent Sidecar Panel */}
          <button
            onClick={toggleAgent}
            title={isAgentOpen ? "Collapse Chief of Staff" : "Open Chief of Staff"}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-unbounded font-medium transition cursor-pointer border",
              isAgentOpen
                ? "bg-[#816797]/15 border-[#816797]/40 text-[#816797] dark:text-[#D6D5A8]"
                : "bg-white dark:bg-[#1B2430] border-slate-200 dark:border-[#51557E]/40 text-slate-600 dark:text-neutral-400 hover:text-[#1B2430] dark:hover:text-white"
            )}
          >
            <Bot className="w-3.5 h-3.5 text-[#816797] dark:text-[#D6D5A8]" />
            <span className="hidden md:inline">Chief AI</span>
          </button>
        </div>
      </div>

      {/* Main Section Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-unbounded font-bold text-xl md:text-2xl tracking-tight text-[#1B2430] dark:text-white">
              Kara AI Chief of Staff
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Autonomous Engine Active
            </span>
          </div>
          <p className="font-albert text-xs md:text-sm text-slate-500 dark:text-[#D6D5A8]/70">
            Real-time meeting ingestion, Deepgram Nova-3 diarization, Groq MOM synthesis, and Twenty CRM sync.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveModule("meetings")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-tr from-[#1B2430] to-[#51557E] text-white hover:opacity-90 text-xs font-albert font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#D6D5A8]" />
            <span>Dispatch Bot</span>
          </button>
        </div>
      </div>

      {/* Top 4 Real-World KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Meetings */}
        <div className="rounded-2xl bg-white dark:bg-[#131922] border border-slate-200/80 dark:border-[#51557E]/30 p-5 shadow-xs space-y-2 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="font-albert text-xs font-semibold text-slate-600 dark:text-neutral-300">
              Meetings Ingested
            </span>
            <div className="w-5 h-5 rounded-md bg-[#816797]/15 text-[#816797] flex items-center justify-center">
              <Video className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-unbounded tracking-tight text-[#1B2430] dark:text-white">
            15,612
          </div>
          <p className="font-albert text-[11px] text-slate-400 dark:text-[#D6D5A8]/60">
            320+ hrs transcribed with Deepgram
          </p>
        </div>

        {/* Card 2: Action Items */}
        <div className="rounded-2xl bg-white dark:bg-[#131922] border border-slate-200/80 dark:border-[#51557E]/30 p-5 shadow-xs space-y-2 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="font-albert text-xs font-semibold text-slate-600 dark:text-neutral-300">
              Action Items
            </span>
            <div className="w-5 h-5 rounded-md bg-[#D6D5A8]/20 text-[#816797] dark:text-[#D6D5A8] flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-unbounded tracking-tight text-[#1B2430] dark:text-white">
            1,428
          </div>
          <p className="font-albert text-[11px] text-slate-400 dark:text-[#D6D5A8]/60">
            Promoted into Kanban Task OS
          </p>
        </div>

        {/* Card 3: CRM Value */}
        <div className="rounded-2xl bg-white dark:bg-[#131922] border border-slate-200/80 dark:border-[#51557E]/30 p-5 shadow-xs space-y-2 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="font-albert text-xs font-semibold text-slate-600 dark:text-neutral-300">
              Twenty CRM Value
            </span>
            <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-unbounded tracking-tight text-[#1B2430] dark:text-white">
            $780K
          </div>
          <p className="font-albert text-[11px] text-slate-400 dark:text-[#D6D5A8]/60">
            Indexed in PostgreSQL JSONB
          </p>
        </div>

        {/* Card 4: Reflex Speed */}
        <div className="rounded-2xl bg-white dark:bg-[#131922] border border-slate-200/80 dark:border-[#51557E]/30 p-5 shadow-xs space-y-2 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="font-albert text-xs font-semibold text-slate-600 dark:text-neutral-300">
              Laya Reflex Speed
            </span>
            <div className="w-5 h-5 rounded-md bg-[#51557E]/20 text-[#51557E] dark:text-[#D6D5A8] flex items-center justify-center">
              <Cpu className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-unbounded tracking-tight text-[#1B2430] dark:text-white">
            33ms
          </div>
          <p className="font-albert text-[11px] text-slate-400 dark:text-[#D6D5A8]/60">
            Fast intent & routing latency
          </p>
        </div>
      </div>

      {/* Center 2-Column Section: Telemetry Histogram + Live Meeting Bots */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left (3 Cols): Matrix Dot Histogram Chart */}
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-[#131922] border border-slate-200/80 dark:border-[#51557E]/30 p-6 shadow-xs space-y-5 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-unbounded font-semibold text-sm text-[#1B2430] dark:text-white">
                Speech Ingestion & Diarization Telemetry
              </h2>
              <p className="font-albert text-[11px] text-slate-400 dark:text-[#51557E]">
                Raw audio stream volume & speaker turn density across the monorepo
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#51557E]/30 text-xs font-albert">
                <button
                  onClick={() => setChartMetric("total")}
                  className={clsx(
                    "px-2.5 py-1 rounded-md transition cursor-pointer",
                    chartMetric === "total"
                      ? "bg-white text-[#1B2430] shadow-xs dark:bg-[#51557E] dark:text-white font-medium"
                      : "text-slate-500 hover:text-[#1B2430] dark:text-[#51557E] dark:hover:text-white"
                  )}
                >
                  Speech Min
                </button>
                <button
                  onClick={() => setChartMetric("impact")}
                  className={clsx(
                    "px-2.5 py-1 rounded-md transition cursor-pointer",
                    chartMetric === "impact"
                      ? "bg-white text-[#1B2430] shadow-xs dark:bg-[#51557E] dark:text-white font-medium"
                      : "text-slate-500 hover:text-[#1B2430] dark:text-[#51557E] dark:hover:text-white"
                  )}
                >
                  pgvector Chunks
                </button>
              </div>

              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#51557E]/30 text-xs font-albert text-slate-700 dark:text-neutral-300 hover:text-[#1B2430] dark:hover:text-white transition cursor-pointer">
                <span>Daily</span>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#51557E]" />
              </button>
            </div>
          </div>

          {/* Matrix Histogram */}
          <div className="space-y-3">
            <div className="flex items-end gap-3 h-48 w-full pt-2">
              <div className="flex flex-col justify-between h-full text-[10px] font-mono text-slate-400 dark:text-[#51557E] text-right pr-2 shrink-0 select-none">
                <span>300m</span>
                <span>200m</span>
                <span>100m</span>
                <span>0m</span>
              </div>

              <div className="flex-1 h-full flex items-end justify-between gap-1 pb-1 border-b border-slate-200 dark:border-[#51557E]/20">
                {matrixColumns.map((col, cIdx) => (
                  <div key={cIdx} className="flex-1 flex flex-col-reverse gap-0.5 items-center">
                    {Array.from({ length: 15 }).map((_, rIdx) => {
                      const isLit = rIdx < col.height;
                      return (
                        <span
                          key={rIdx}
                          className={clsx(
                            "w-full max-w-[8px] h-2 rounded-[2px] transition-all duration-150",
                            isLit
                              ? cIdx % 3 === 0
                                ? "bg-[#816797] dark:bg-[#A5C9CA] shadow-[0_0_6px_rgba(129,103,151,0.3)] dark:shadow-[0_0_6px_rgba(165,201,202,0.4)]"
                                : "bg-[#1B2430] dark:bg-[#51557E] hover:bg-[#816797]"
                              : "bg-slate-100 dark:bg-[#1B2430]/40"
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pl-12 text-[10px] font-mono text-slate-400 dark:text-[#51557E]">
              <span>Mar 10</span>
              <span>Mar 16</span>
              <span>Mar 23</span>
              <span>Mar 30</span>
              <span>Apr 6</span>
            </div>
          </div>
        </div>

        {/* Right (2 Cols): Live Bot Ingestion & Active Calls */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#131922] border border-slate-200/80 dark:border-[#51557E]/30 p-6 shadow-xs space-y-4 transition-colors duration-200 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#51557E]/20">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h3 className="font-unbounded font-semibold text-xs text-[#1B2430] dark:text-white">
                  Live Meeting Bots
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                3 Active
              </span>
            </div>

            <div className="space-y-2.5">
              {liveMeetings.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-[#51557E]/30 bg-slate-50/70 dark:bg-[#1B2430]/60 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-albert font-semibold text-xs text-[#1B2430] dark:text-white line-clamp-1">
                      {m.title}
                    </span>
                    <span
                      className={clsx(
                        "text-[9px] font-mono px-1.5 py-0.2 rounded font-medium border shrink-0",
                        m.statusColor
                      )}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-[#51557E]">
                    <span>{m.platform}</span>
                    <span>Elapsed: {m.duration}</span>
                    <span>Turns: {m.speakerTurns}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveModule("meetings")}
            className="w-full py-2 rounded-xl border border-slate-200 dark:border-[#51557E]/40 hover:bg-slate-100 dark:hover:bg-[#1B2430] text-xs font-albert font-semibold text-slate-700 dark:text-neutral-200 transition cursor-pointer text-center"
          >
            View Live Diarization Stream →
          </button>
        </div>
      </div>

      {/* Attribution Table Card: Meeting Actions & Synthesis */}
      <div className="rounded-2xl bg-white dark:bg-[#131922] border border-slate-200/80 dark:border-[#51557E]/30 p-6 shadow-xs space-y-4 transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#51557E]/20">
          <div>
            <h2 className="font-unbounded font-semibold text-sm text-[#1B2430] dark:text-white">
              Recent Decisions & Task Ingestion
            </h2>
            <p className="font-albert text-[11px] text-slate-400 dark:text-[#51557E]">
              Minutes of Meeting (MOM) synthesized by Groq Llama 3.3 and promoted to Kanban
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModule("tasks")}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-[#51557E]/40 bg-slate-50 dark:bg-[#1B2430]/40 hover:bg-slate-100 dark:hover:bg-[#1B2430] text-xs font-albert font-medium text-slate-700 dark:text-neutral-300 hover:text-[#1B2430] dark:hover:text-white transition cursor-pointer"
            >
              Open Kanban Task OS →
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-albert">
            <thead>
              <tr className="border-b border-slate-200/70 dark:border-[#51557E]/20 text-[10px] font-unbounded font-semibold text-slate-400 dark:text-[#51557E] uppercase tracking-wider">
                <th className="py-2.5 px-3">Meeting / Source</th>
                <th className="py-2.5 px-3">Pipeline Stage</th>
                <th className="py-2.5 px-3">Action Items</th>
                <th className="py-2.5 px-3">Owner / Squad</th>
                <th className="py-2.5 px-3 text-right">Value / Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#51557E]/10">
              {attributionRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setActiveModule("tasks")}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#1B2430]/40 transition cursor-pointer group"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#816797]/15 text-[#816797] flex items-center justify-center font-bold text-[10px]">
                        {row.platform === "Google Meet" ? "G" : row.platform === "Zoom" ? "Z" : "T"}
                      </div>
                      <div>
                        <span className="font-semibold text-[#1B2430] dark:text-white group-hover:text-[#816797] transition">
                          {row.name}
                        </span>
                        <p className="text-[10px] text-slate-400 dark:text-[#51557E]">
                          {row.platform} • Deepgram Nova-3
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-mono",
                        row.statusColor
                      )}
                    >
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {row.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-neutral-300">
                    {row.tasks}
                  </td>

                  <td className="py-3 px-3 font-medium text-slate-600 dark:text-[#D6D5A8]/80">
                    {row.owner}
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-[#1B2430] dark:text-white text-right">
                    {row.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
