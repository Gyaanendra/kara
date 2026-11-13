"use client";

import React, { useState } from "react";
import clsx from "clsx";
import {
  Search,
  Bell,
  Palette,
  Bot,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useWorkspaceStore } from "../../lib/store";
import { KpiCard } from "../ui/KpiCard";
import { TelemetryChartCard } from "../ui/TelemetryChartCard";
import { BreakdownDonutCard } from "../ui/BreakdownDonutCard";
import { TopMeetingsCard } from "../ui/TopMeetingsCard";
import { DataTable, type TableRowData } from "../ui/DataTable";

/* 30-day activity histograms (12 sampled bars each) */
const SPARK_MEETINGS = [8, 6, 9, 12, 10, 14, 11, 16, 13, 18, 15, 21];
const SPARK_TASKS = [5, 7, 6, 9, 8, 11, 9, 13, 10, 14, 12, 16];
const SPARK_CRM = [6, 8, 7, 10, 9, 12, 10, 14, 11, 15, 13, 18];
const SPARK_REFLEX = [14, 13, 15, 12, 13, 11, 12, 10, 11, 9, 10, 8];

/* Monthly speech-minutes + diarized-turns telemetry (Jan → Dec) */
const SPEECH_MIN_MONTHLY = [7800, 9100, 8400, 10200, 9800, 12400, 11600, 13200, 12100, 14800, 13900, 15600];
const TURNS_MONTHLY = [11200, 12800, 11900, 14600, 13900, 18600, 17200, 19800, 18100, 21400, 20200, 23600];
const CHUNKS_MONTHLY = [6100, 7200, 6800, 8300, 7900, 9600, 8900, 10400, 9700, 11800, 11000, 12600];

const BREAKDOWN_SLICES = [
  { name: "Google Meet", weight: 0.382, color: "var(--chart-1)" },
  { name: "Zoom", weight: 0.257, color: "var(--chart-2)" },
  { name: "MS Teams", weight: 0.174, color: "var(--chart-3)" },
  { name: "In-Person Uploads", weight: 0.187, color: "var(--chart-4)" },
];

const TOP_MEETINGS = [
  { name: "Q3 Architecture & Database Standup", value: "$450,000", changePercent: 12.5 },
  { name: "Enterprise Deal Review — Query Cloud", value: "$125,000", changePercent: 8.3 },
  { name: "Customer SLA & Price Cap Audit", value: "$56,900", changePercent: -3.2 },
  { name: "Weekly Executive Standup — Growth", value: "$148,000", changePercent: 5.1 },
];

const TABLE_ROWS: TableRowData[] = [
  {
    id: "attr-1",
    name: "Q3 Architecture & Database Standup",
    platform: "Google Meet",
    status: "synthesized",
    statusLabel: "MOM Synthesized",
    tasks: "6 tasks in Kanban",
    owner: "Alex Chen (Engineering)",
    impact: "$450,000",
  },
  {
    id: "attr-2",
    name: "Enterprise Deal Review — Query Cloud",
    platform: "Zoom",
    status: "synced",
    statusLabel: "Twenty CRM Synced",
    tasks: "4 obligations created",
    owner: "Helena Derwent (Finance)",
    impact: "$125,000",
  },
  {
    id: "attr-3",
    name: "Customer SLA & Price Cap Audit",
    platform: "Google Meet",
    status: "processing",
    statusLabel: "Diarization Complete",
    tasks: "2 price caps checked",
    owner: "Subash K. (Security)",
    impact: "$56,900",
  },
  {
    id: "attr-4",
    name: "Weekly Executive Standup — Growth",
    platform: "MS Teams",
    status: "assigned",
    statusLabel: "Action Items Assigned",
    tasks: "8 tasks in Kanban",
    owner: "Sarah Jenkins (Procurement)",
    impact: "$148,000",
  },
];

export function OverviewDashboard() {
  const {
    isAgentOpen,
    toggleAgent,
    chartMetric,
    searchQuery,
    setSearchQuery,
    setActiveModule,
    setThemeSettingsOpen,
  } = useWorkspaceStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSync = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Top Bar: breadcrumb + global search | actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line select-none">
        {/* Left: breadcrumb & search */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-albert text-ink-muted">
            <span className="hover:text-ink transition cursor-pointer">
              Kara AI OS
            </span>
            <span>•</span>
            <span className="font-semibold text-ink">
              Chief of Staff Overview
            </span>
          </div>

          <div className="relative flex items-center rounded-lg bg-card border border-line px-2.5 py-1.5 text-xs shadow-2xs focus-within:border-line-strong transition">
            <Search className="w-3.5 h-3.5 text-ink-muted mr-1.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings, decisions, deals, action items..."
              className="bg-transparent text-xs font-albert text-ink placeholder-ink-muted focus:outline-hidden w-44 lg:w-64"
            />
            <kbd className="text-[10px] font-mono text-ink-muted ml-2 border border-line rounded px-1 shrink-0">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: actions — Sync, Bell, Theme picker, Chief AI toggle */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSync}
            title="Sync Workspace"
            className="flex items-center gap-1.5 text-xs font-albert text-ink-muted hover:text-ink transition cursor-pointer hidden sm:inline-flex"
          >
            <RefreshCw
              className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin")}
            />
            <span>{isRefreshing ? "Syncing..." : "Sync Workspace"}</span>
          </button>

          <button
            title="Notifications"
            className="relative p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-hovered transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-error" />
          </button>

          {/* Theme Color Profiles picker */}
          <button
            onClick={() => setThemeSettingsOpen(true)}
            title="Color Profiles & Theme"
            className="p-1.5 rounded-lg bg-card border border-line text-accent shadow-2xs hover:border-accent transition cursor-pointer"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Toggle Chief of Staff sidecar panel */}
          <button
            onClick={toggleAgent}
            title={isAgentOpen ? "Collapse Chief of Staff" : "Open Chief of Staff"}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-unbounded font-medium transition cursor-pointer border",
              isAgentOpen
                ? "bg-accent-soft border-accent/40 text-accent"
                : "bg-card border-line text-ink-muted hover:text-ink"
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Chief AI</span>
          </button>
        </div>
      </div>

      {/* Main Section Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-unbounded font-bold text-header-md tracking-tight text-ink">
              Kara AI Chief of Staff
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-success/10 text-success border border-success/25 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Autonomous Engine Active
            </span>
          </div>
          <p className="font-albert text-body-base text-ink-secondary">
            Real-time meeting ingestion, Deepgram Nova-3 diarization, Groq MOM
            synthesis, and Twenty CRM sync.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveModule("meetings")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-on-accent text-xs font-albert font-semibold shadow-2xs hover:opacity-90 active:opacity-80 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dispatch Bot</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards with embedded sparkline histograms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Meetings Ingested"
          value="15,612"
          changePercent={18.6}
          changePeriod="vs last month"
          sparklineData={SPARK_MEETINGS}
          info="320+ hrs transcribed with Deepgram Nova-3"
        />
        <KpiCard
          label="Action Items"
          value="1,428"
          changePercent={12.4}
          changePeriod="vs last month"
          sparklineData={SPARK_TASKS}
          info="Promoted into Kanban Task OS"
        />
        <KpiCard
          label="CRM Value"
          value="$780K"
          changePercent={9.8}
          changePeriod="vs last month"
          sparklineData={SPARK_CRM}
          info="Indexed in PostgreSQL JSONB"
        />
        <KpiCard
          label="Reflex Speed"
          value="33ms"
          changePercent={15.2}
          changePeriod="faster vs last month"
          sparklineData={SPARK_REFLEX}
          info="Groq LPU median decision latency"
        />
      </div>

      {/* Telemetry chart (65%) + Donut / Top meetings (35%) */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-start">
        <TelemetryChartCard
          title="Speech Ingestion & Diarization Telemetry"
          subtitle="Deepgram Nova-3 streaming diarization volume across platforms"
          primaryLabel={chartMetric === "total" ? "Total Speech Minutes" : "pgvector Chunks"}
          primaryValue={chartMetric === "total" ? "48,520" : "96,300"}
          unit={chartMetric === "total" ? "min" : "chunks"}
          series={
            chartMetric === "total"
              ? [
                  { name: "Speech Duration", color: "var(--chart-1)", values: SPEECH_MIN_MONTHLY },
                  { name: "Diarized Turns", color: "var(--chart-2)", values: TURNS_MONTHLY },
                ]
              : [
                  { name: "pgvector Chunks", color: "var(--chart-3)", values: CHUNKS_MONTHLY },
                ]
          }
          className="xl:col-span-3"
        />

        <div className="xl:col-span-2 space-y-4">
          <BreakdownDonutCard
            title="Decision & Task Breakdown"
            subtitle="Speaker turns by meeting platform, last 30 days"
            totalLabel="Total Turns"
            totalValue="15,612"
            slices={BREAKDOWN_SLICES}
          />
          <TopMeetingsCard
            title="Top Recent Meetings"
            subtitle="High-impact deals surfaced by Kara"
            rows={TOP_MEETINGS}
          />
        </div>
      </div>

      {/* Dense attribution data table */}
      <DataTable
        title="Recent Decisions & Task Ingestion"
        subtitle="MOM synthesis pipeline → Kanban Task OS → Twenty CRM"
        rows={TABLE_ROWS}
        primaryActionLabel="Dispatch Bot"
        onPrimaryAction={() => setActiveModule("meetings")}
      />
    </div>
  );
}
