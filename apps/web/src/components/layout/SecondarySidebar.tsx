"use client";

import React from "react";
import clsx from "clsx";
import {
  Plus,
  ChevronDown,
  SlidersHorizontal,
  Archive,
  Users,
  Shield,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  Send,
  PanelLeftClose,
} from "lucide-react";
import { useWorkspaceStore, NavModule } from "../../lib/store";
import { SearchInput } from "../ui/SearchInput";

export function SecondarySidebar() {
  const {
    activeModule,
    setActiveModule,
    secondaryFilter,
    setSecondaryFilter,
    selectedVendor,
    setSelectedVendor,
    searchQuery,
    setSearchQuery,
    toggleSidebar,
  } = useWorkspaceStore();

  return (
    <div className="w-full h-full flex flex-col justify-between py-4 px-3.5 bg-slate-50/70 dark:bg-[#0c0d12] select-none overflow-y-auto">
      <div className="space-y-4">
        {/* Module-Specific Header & Segmented Control */}
        {activeModule === "alerts" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                Alerts
              </span>
              <button
                onClick={toggleSidebar}
                title="Collapse sidebar panel"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-white/5 transition cursor-pointer"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Segmented Filter Pills */}
            <div className="flex p-0.5 rounded-lg bg-slate-200/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
              <button
                onClick={() => setSecondaryFilter("open")}
                className={clsx(
                  "flex-1 py-1 text-[11px] font-medium rounded-md transition cursor-pointer text-center",
                  secondaryFilter === "open"
                    ? "bg-white text-neutral-900 shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                Open
              </button>
              <button
                onClick={() => setSecondaryFilter("resolved")}
                className={clsx(
                  "flex-1 py-1 text-[11px] font-medium rounded-md transition cursor-pointer text-center",
                  secondaryFilter === "resolved"
                    ? "bg-white text-neutral-900 shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                Resolved
              </button>
            </div>

            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alerts"
            />

            {/* Category Tree */}
            <div className="space-y-3 pt-1 text-xs">
              <div>
                <button className="flex items-center justify-between w-full px-2 py-1.5 rounded-md font-medium text-neutral-900 dark:text-white bg-slate-200/50 dark:bg-white/10 cursor-pointer">
                  <span>All alerts</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                    7
                  </span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="px-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  By type
                </span>
                <div className="space-y-0.5 text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Deals</span>
                    <span className="text-[10px] font-mono">2</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer font-medium text-neutral-900 dark:text-zinc-200">
                    <span>Money</span>
                    <span className="text-[10px] font-mono">3</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Evidence</span>
                    <span className="text-[10px] font-mono">1</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Overdue</span>
                    <span className="text-[10px] font-mono">1</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="px-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  By vendor
                </span>
                <div className="space-y-0.5 text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Query Cloud</span>
                    <span className="text-[10px] font-mono">3</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Fleafix Freight</span>
                    <span className="text-[10px] font-mono">2</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Sterk Networks</span>
                    <span className="text-[10px] font-mono">1</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Sheffield Data</span>
                    <span className="text-[10px] font-mono">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModule === "contracts" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Contracts
              </span>
              <div className="flex items-center gap-1">
                <button
                  title="Add new contract"
                  className="w-5 h-5 rounded flex items-center justify-center bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-zinc-200 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={toggleSidebar}
                  title="Collapse sidebar panel"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex p-0.5 rounded-lg bg-slate-200/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
              <button
                onClick={() => setSecondaryFilter("active")}
                className={clsx(
                  "flex-1 py-1 text-[11px] font-medium rounded-md transition cursor-pointer text-center",
                  secondaryFilter === "active"
                    ? "bg-white text-neutral-900 shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                Active (49)
              </button>
              <button
                onClick={() => setSecondaryFilter("all")}
                className={clsx(
                  "flex-1 py-1 text-[11px] font-medium rounded-md transition cursor-pointer text-center",
                  secondaryFilter === "all"
                    ? "bg-white text-neutral-900 shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                All
              </button>
            </div>

            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts"
            />

            <div className="space-y-3 pt-1 text-xs">
              <button className="flex items-center justify-between w-full px-2 py-1.5 rounded-md font-medium text-neutral-900 dark:text-white bg-slate-200/50 dark:bg-white/10 cursor-pointer">
                <span>All contracts</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  49
                </span>
              </button>

              <div className="space-y-1">
                <span className="px-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  By status
                </span>
                <div className="space-y-0.5 text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Active</span>
                    <span className="text-[10px] font-mono">44</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>In review</span>
                    <span className="text-[10px] font-mono">3</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Expired</span>
                    <span className="text-[10px] font-mono">2</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="px-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Recent
                </span>
                <div className="space-y-0.5 text-slate-600 dark:text-zinc-400">
                  <div
                    onClick={() => {
                      setSelectedVendor("Query Cloud");
                      setActiveModule("obligations");
                    }}
                    className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer truncate font-medium text-neutral-800 dark:text-zinc-200"
                  >
                    Query Cloud
                  </div>
                  <div className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer truncate">
                    Sterk Networks
                  </div>
                  <div className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer truncate">
                    Sheffield Data
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeModule === "obligations" ||
          activeModule === "vetted" ||
          activeModule === "approvals") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {selectedVendor}
              </span>
              <button
                onClick={toggleSidebar}
                title="Collapse sidebar panel"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-white/5 transition cursor-pointer"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search this vendor..."
            />

            <div className="space-y-3 pt-1 text-xs">
              <div className="space-y-1">
                <span className="px-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Core
                </span>
                <div className="space-y-0.5 text-slate-600 dark:text-zinc-400">
                  <div
                    onClick={() => setActiveModule("obligations")}
                    className={clsx(
                      "flex items-center justify-between px-2 py-1 rounded cursor-pointer transition",
                      activeModule === "obligations"
                        ? "bg-slate-200/70 text-neutral-900 font-medium dark:bg-white/10 dark:text-white"
                        : "hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    <span>Overview / SLA</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Requirements</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      12/12
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Documents</span>
                  </div>
                  <div
                    onClick={() => setActiveModule("vetted")}
                    className={clsx(
                      "flex items-center justify-between px-2 py-1 rounded cursor-pointer transition",
                      activeModule === "vetted"
                        ? "bg-slate-200/70 text-neutral-900 font-medium dark:bg-white/10 dark:text-white"
                        : "hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    <span>Activity</span>
                    <span className="text-[10px] font-mono">12</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="px-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Review Tracks
                </span>
                <div className="space-y-0.5 text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Security</span>
                    <span className="text-[10px] font-mono bg-slate-200/70 dark:bg-white/10 px-1 rounded">
                      3
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Legal</span>
                    <span className="text-[10px] font-mono bg-slate-200/70 dark:bg-white/10 px-1 rounded">
                      2
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Compliance</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                    <span>Finance</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="px-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Risk & Findings
                </span>
                <div className="space-y-0.5 text-slate-600 dark:text-zinc-400">
                  <div
                    onClick={() => setActiveModule("approvals")}
                    className={clsx(
                      "flex items-center justify-between px-2 py-1 rounded cursor-pointer transition",
                      activeModule === "approvals"
                        ? "bg-slate-200/70 text-neutral-900 font-medium dark:bg-white/10 dark:text-white"
                        : "hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    <span>Final Approval</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeModule === "meetings" ||
          activeModule === "tasks" ||
          activeModule === "crm" ||
          activeModule === "chat") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 capitalize">
                {activeModule} Engine
              </span>
              <button
                onClick={toggleSidebar}
                title="Collapse sidebar panel"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-white/5 transition cursor-pointer"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeModule}...`}
            />
            <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-400">
              <div
                onClick={() => setActiveModule("meetings")}
                className={clsx(
                  "px-2 py-1 rounded cursor-pointer",
                  activeModule === "meetings" &&
                    "bg-slate-200/70 font-medium text-neutral-900 dark:bg-white/10 dark:text-white"
                )}
              >
                All Meetings (Deepgram)
              </div>
              <div
                onClick={() => setActiveModule("tasks")}
                className={clsx(
                  "px-2 py-1 rounded cursor-pointer",
                  activeModule === "tasks" &&
                    "bg-slate-200/70 font-medium text-neutral-900 dark:bg-white/10 dark:text-white"
                )}
              >
                Kanban Task OS
              </div>
              <div
                onClick={() => setActiveModule("crm")}
                className={clsx(
                  "px-2 py-1 rounded cursor-pointer",
                  activeModule === "crm" &&
                    "bg-slate-200/70 font-medium text-neutral-900 dark:bg-white/10 dark:text-white"
                )}
              >
                Twenty CRM Engine
              </div>
              <div
                onClick={() => setActiveModule("chat")}
                className={clsx(
                  "px-2 py-1 rounded cursor-pointer",
                  activeModule === "chat" &&
                    "bg-slate-200/70 font-medium text-neutral-900 dark:bg-white/10 dark:text-white"
                )}
              >
                Grounded Mastra AI Chat
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Shortcuts */}
      <div className="pt-3 border-t border-slate-200/70 dark:border-white/10 space-y-1 text-[11px] text-slate-500 dark:text-zinc-400">
        {activeModule === "alerts" ? (
          <>
            <div className="flex items-center justify-between px-2 py-1 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer">
              <span>Alert rules</span>
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center justify-between px-2 py-1 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer">
              <span>Dismissed</span>
              <span className="font-mono text-[10px]">3</span>
            </div>
          </>
        ) : activeModule === "contracts" ? (
          <>
            <div className="flex items-center justify-between px-2 py-1 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer">
              <span>Archive</span>
              <span className="font-mono text-[10px]">12</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer">
              <span>Vendor contacts</span>
              <Users className="w-3 h-3 text-slate-400" />
            </div>
          </>
        ) : (
          <button className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded-lg bg-slate-200/60 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-zinc-200 font-medium transition cursor-pointer">
            <Send className="w-3 h-3" />
            <span>Message vendor</span>
          </button>
        )}
      </div>
    </div>
  );
}
