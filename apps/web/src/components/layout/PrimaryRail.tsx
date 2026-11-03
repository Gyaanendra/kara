"use client";

import React from "react";
import clsx from "clsx";
import {
  Bell,
  FileText,
  ShieldAlert,
  Activity,
  CheckSquare,
  Video,
  KanbanSquare,
  Database,
  Sparkles,
  Sun,
  Moon,
  Settings,
  PanelLeft,
} from "lucide-react";
import { useWorkspaceStore, NavModule } from "../../lib/store";

interface RailItem {
  id: NavModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export function PrimaryRail() {
  const {
    activeModule,
    setActiveModule,
    theme,
    toggleTheme,
    isSidebarOpen,
    toggleSidebar,
  } = useWorkspaceStore();

  const mainNav: RailItem[] = [
    { id: "alerts", label: "Alerts", icon: Bell, badge: 7 },
    { id: "contracts", label: "Contracts", icon: FileText, badge: 49 },
    { id: "obligations", label: "Obligations", icon: ShieldAlert },
    { id: "vetted", label: "Vetted Vendors", icon: Activity },
    { id: "approvals", label: "Final Approval", icon: CheckSquare },
  ];

  const karaEngineNav: RailItem[] = [
    { id: "meetings", label: "Meeting Bot", icon: Video },
    { id: "tasks", label: "Task OS", icon: KanbanSquare },
    { id: "crm", label: "Twenty CRM", icon: Database },
    { id: "chat", label: "Kara RAG Chat", icon: Sparkles },
  ];

  return (
    <aside className="w-14 shrink-0 flex flex-col items-center justify-between py-4 border-r border-slate-200/70 dark:border-white/10 bg-slate-50/90 dark:bg-[#0c0d12] select-none z-20">
      {/* Top Brand Logo & Toggle */}
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          onClick={() => setActiveModule("alerts")}
          title="Kara Autonomous OS"
          className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          P
        </button>

        {/* Sidebar Collapse/Expand Toggle */}
        <button
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Collapse Panel" : "Expand Panel"}
          className={clsx(
            "w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer",
            isSidebarOpen
              ? "text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-white/5"
              : "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/15"
          )}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="w-5 h-[1px] bg-slate-200 dark:bg-white/10" />

        {/* Primary Views Section */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                title={item.label}
                className={clsx(
                  "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer group",
                  isActive
                    ? "bg-white text-neutral-900 shadow-xs border border-slate-200/80 dark:bg-white/15 dark:text-white dark:border-white/20"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.badge && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0c0d12]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Kara Core Subsystems Divider */}
        <div className="w-5 h-[1px] bg-slate-200 dark:bg-white/10" />

        <nav className="flex flex-col items-center gap-1.5 w-full px-2">
          {karaEngineNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                title={item.label}
                className={clsx(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                  isActive
                    ? "bg-white text-neutral-900 shadow-xs border border-slate-200/80 dark:bg-white/15 dark:text-white dark:border-white/20"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-2.5 w-full px-2">
        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "Dark (Obsidian)" : "Light (Porcelain)"} mode`}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/10 transition cursor-pointer"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4 text-slate-500" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        <button
          title="Settings"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/10 transition cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div
          title="Helena Derwent — Head of Finance"
          className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer ring-1 ring-slate-300 dark:ring-white/20 hover:scale-105 transition"
        >
          HD
        </div>
      </div>
    </aside>
  );
}
