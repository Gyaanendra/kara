"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { useWorkspaceStore } from "../../lib/store";
import { KaraSidebar } from "./KaraSidebar";
import { AgentPanel } from "./AgentPanel";
import { OverviewDashboard } from "../views/OverviewDashboard";
import { AlertsView } from "../views/AlertsView";
import { ContractsView } from "../views/ContractsView";
import { ObligationDetailView } from "../views/ObligationDetailView";
import { ActivityAuditView } from "../views/ActivityAuditView";
import { ApprovalMatrixView } from "../views/ApprovalMatrixView";
import dynamic from "next/dynamic";

const MeetingsView = dynamic(() => import("../../app/meetings/page"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-xs text-slate-400 dark:text-zinc-500 font-mono">
      Loading Kara Deepgram Meeting Engine...
    </div>
  ),
});

const TasksView = dynamic(() => import("../../app/tasks/page"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-xs text-slate-400 dark:text-zinc-500 font-mono">
      Loading Notion-Style Kanban Task OS...
    </div>
  ),
});

const CrmView = dynamic(() => import("../../app/crm/page"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-xs text-slate-400 dark:text-zinc-500 font-mono">
      Loading Twenty CRM Engine...
    </div>
  ),
});

const ChatView = dynamic(() => import("../../app/chat/page"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-xs text-slate-400 dark:text-zinc-500 font-mono">
      Loading Grounded Kara Mastra AI...
    </div>
  ),
});

export function AppShell({ children }: { children?: React.ReactNode }) {
  const { theme, activeModule } = useWorkspaceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const renderActiveView = () => {
    switch (activeModule) {
      case "overview":
        return <OverviewDashboard />;
      case "alerts":
        return <AlertsView />;
      case "contracts":
        return <ContractsView />;
      case "obligations":
        return <ObligationDetailView />;
      case "vetted":
        return <ActivityAuditView />;
      case "approvals":
        return <ApprovalMatrixView />;
      case "meetings":
        return <MeetingsView />;
      case "tasks":
        return <TasksView />;
      case "crm":
        return <CrmView />;
      case "chat":
        return <ChatView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div
      className={clsx(
        "h-screen w-screen overflow-hidden flex select-none transition-colors duration-200",
        theme === "dark"
          ? "dark bg-[#0B0E14] text-white"
          : "bg-[#F4F5F8] text-[#1B2430]"
      )}
    >
      {/* Left Navigation Sidebar */}
      <KaraSidebar />

      {/* Center Dynamic Content Workspace */}
      <main className="flex-1 h-full min-w-0 overflow-y-auto bg-[#F4F5F8] dark:bg-[#0B0E14] transition-colors duration-200">
        <div className="max-w-[1560px] w-full mx-auto p-5 md:p-7 lg:p-8 space-y-6">
          {mounted ? renderActiveView() : children}
        </div>
      </main>

      {/* Right Agent Assistant Panel */}
      <AgentPanel />
    </div>
  );
}
