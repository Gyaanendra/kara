"use client";

import React from "react";
import clsx from "clsx";
import {
  Home,
  Sparkles,
  Target,
  FileBarChart,
  Activity,
  GitBranch,
  CheckSquare,
  Compass,
  BellRing,
  MessageSquare,
  Users,
  PieChart,
  HelpCircle,
  Settings,
  ChevronsUpDown,
} from "lucide-react";
import { useWorkspaceStore } from "../../lib/store";

export function FulcrumSidebar() {
  const { activeNav, setActiveNav, isSidebarOpen } = useWorkspaceStore();

  const reviewItems = [
    { id: "goals", label: "Goals", icon: Target },
    { id: "reports", label: "Reports", icon: FileBarChart },
    { id: "user-activity", label: "User activity", icon: Activity },
    { id: "flow-activity", label: "Flow activity", icon: GitBranch },
  ];

  const onboardingItems = [
    { id: "flows", label: "Flows", icon: GitBranch },
    { id: "checklists", label: "Checklists", icon: CheckSquare },
    { id: "tours", label: "Product tours", icon: Compass },
    { id: "nudges", label: "Nudges", icon: BellRing },
    { id: "library", label: "Message library", icon: MessageSquare },
  ];

  const audienceItems = [
    { id: "users", label: "Users", icon: Users },
    { id: "segments", label: "Segments", icon: PieChart },
  ];

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-56 lg:w-60 shrink-0 h-full flex flex-col justify-between py-4 px-3 border-r border-slate-200 dark:border-[#51557E]/20 bg-white dark:bg-[#0B0E14] text-slate-700 dark:text-neutral-300 select-none overflow-y-auto transition-colors duration-200">
      <div className="space-y-5">
        {/* Workspace Brand Dropdown */}
        <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-slate-50 dark:bg-[#1B2430]/80 border border-slate-200 dark:border-[#51557E]/30 cursor-pointer hover:border-[#816797]/50 transition">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#816797] to-[#51557E] flex items-center justify-center text-white font-unbounded text-[10px] font-bold">
              F
            </div>
            <span className="font-unbounded text-xs font-semibold tracking-tight text-[#1B2430] dark:text-white">
              Fulcrum
            </span>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#51557E]" />
        </div>

        {/* Primary Shortcuts */}
        <div className="space-y-0.5">
          <button
            onClick={() => setActiveNav("home")}
            className={clsx(
              "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-albert transition cursor-pointer",
              activeNav === "home"
                ? "bg-slate-100 text-[#1B2430] dark:bg-[#51557E]/30 dark:text-white font-medium"
                : "text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40"
            )}
          >
            <Home className="w-3.5 h-3.5 text-[#816797]" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveNav("agent")}
            className={clsx(
              "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-albert transition cursor-pointer",
              activeNav === "agent"
                ? "bg-slate-100 text-[#1B2430] dark:bg-[#51557E]/30 dark:text-white font-medium"
                : "text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D6D5A8]" />
            <span>Agent</span>
          </button>
        </div>

        {/* Review Group */}
        <div className="space-y-1">
          <span className="px-2.5 text-[10px] font-unbounded font-semibold tracking-wider text-slate-400 dark:text-[#51557E] uppercase">
            Review
          </span>
          <div className="space-y-0.5">
            {reviewItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-albert transition cursor-pointer",
                    isActive
                      ? "bg-slate-100 text-[#1B2430] border border-slate-300/80 dark:bg-[#1B2430] dark:text-white dark:border-[#51557E]/50 font-medium shadow-2xs"
                      : "text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40"
                  )}
                >
                  <Icon
                    className={clsx(
                      "w-3.5 h-3.5",
                      isActive
                        ? "text-[#816797] dark:text-[#D6D5A8]"
                        : "text-slate-400 dark:text-[#51557E]"
                    )}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Onboarding Group */}
        <div className="space-y-1">
          <span className="px-2.5 text-[10px] font-unbounded font-semibold tracking-wider text-slate-400 dark:text-[#51557E] uppercase">
            Onboarding
          </span>
          <div className="space-y-0.5">
            {onboardingItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-albert transition cursor-pointer",
                    isActive
                      ? "bg-slate-100 text-[#1B2430] border border-slate-300/80 dark:bg-[#1B2430] dark:text-white dark:border-[#51557E]/50 font-medium"
                      : "text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40"
                  )}
                >
                  <Icon
                    className={clsx(
                      "w-3.5 h-3.5",
                      isActive
                        ? "text-[#816797]"
                        : "text-slate-400 dark:text-[#51557E]"
                    )}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audience Group */}
        <div className="space-y-1">
          <span className="px-2.5 text-[10px] font-unbounded font-semibold tracking-wider text-slate-400 dark:text-[#51557E] uppercase">
            Audience
          </span>
          <div className="space-y-0.5">
            {audienceItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-albert transition cursor-pointer",
                    isActive
                      ? "bg-slate-100 text-[#1B2430] border border-slate-300/80 dark:bg-[#1B2430] dark:text-white dark:border-[#51557E]/50 font-medium"
                      : "text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40"
                  )}
                >
                  <Icon
                    className={clsx(
                      "w-3.5 h-3.5",
                      isActive
                        ? "text-[#816797] dark:text-[#D6D5A8]"
                        : "text-slate-400 dark:text-[#51557E]"
                    )}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings / Workspace Badge */}
      <div className="pt-4 border-t border-slate-200 dark:border-[#51557E]/20 space-y-3">
        <div className="space-y-1">
          <span className="px-2.5 text-[10px] font-unbounded font-semibold tracking-wider text-slate-400 dark:text-[#51557E] uppercase">
            Settings / Help
          </span>
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-albert text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40 transition cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-[#51557E]" />
              <span>Help Center</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-albert text-slate-600 hover:text-[#1B2430] hover:bg-slate-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1B2430]/40 transition cursor-pointer">
              <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-[#51557E]" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Lazulix Pro Badge */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-[#1B2430]/90 border border-slate-200 dark:border-[#51557E]/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#D6D5A8] flex items-center justify-center text-[#1B2430] font-unbounded text-[10px] font-bold">
              ✦
            </div>
            <span className="font-albert text-xs font-semibold text-[#1B2430] dark:text-white">
              Lazulix
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-unbounded font-semibold bg-[#816797] text-white">
            Pro
          </span>
        </div>
      </div>
    </aside>
  );
}
