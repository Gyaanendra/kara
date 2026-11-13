"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useWorkspaceStore, applyThemeProfile, readStoredThemeProfile } from "../../lib/store";
import { KaraSidebar } from "./KaraSidebar";
import { AgentPanel } from "./AgentPanel";
import { ThemeSettingsModal } from "./ThemeSettingsModal";
import { SettingsView } from "../views/SettingsView";
import { OverviewDashboard } from "../views/OverviewDashboard";
import { AlertsView } from "../views/AlertsView";
import { ContractsView } from "../views/ContractsView";
import { ObligationDetailView } from "../views/ObligationDetailView";
import { ActivityAuditView } from "../views/ActivityAuditView";
import { ApprovalMatrixView } from "../views/ApprovalMatrixView";
import dynamic from "next/dynamic";

const FONT_SCALE_KEY = "kara-font-scale";

const MeetingsView = dynamic(() => import("../../app/meetings/page"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-xs text-ink-muted font-mono">
      Loading Kara Deepgram Meeting Engine...
    </div>
  ),
});

const TasksView = dynamic(() => import("../../app/tasks/page"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-xs text-ink-muted font-mono">
      Loading Notion-Style Kanban Task OS...
    </div>
  ),
});

const CrmView = dynamic(() => import("../../app/crm/page"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-xs text-ink-muted font-mono">
      Loading Twenty CRM Engine...
    </div>
  ),
});

const ChatView = dynamic(() => import("../../app/chat/page"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-xs text-ink-muted font-mono">
      Loading Grounded Kara Mastra AI...
    </div>
  ),
});

const noopSubscribe = () => () => {};

export function AppShell({ children }: { children?: React.ReactNode }) {
  const {
    themeProfile,
    setThemeProfile,
    activeModule,
    isSettingsOpen,
  } = useWorkspaceStore();
  // Hydration gate without setState-in-effect: server render (and the first
  // client render) returns false, then flips to true after hydration.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  // Re-apply the persisted profile after hydration (also covers React's dev
  // Strict Mode remount clearing <html> attributes). The inline boot script
  // in layout.tsx already applied it before first paint, so there's no flash.
  useEffect(() => {
    const stored = readStoredThemeProfile();
    if (stored !== themeProfile) {
      setThemeProfile(stored);
    } else {
      applyThemeProfile(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply the persisted fluid font scale after hydration (SettingsView
  // keeps it in sync afterwards; this covers reloads that land on workspace).
  useEffect(() => {
    if (!mounted) return;
    const stored = Number(window.localStorage.getItem(FONT_SCALE_KEY));
    if (Number.isFinite(stored) && stored >= 85 && stored <= 115) {
      document.documentElement.style.fontSize = `${stored}%`;
    }
  }, [mounted]);

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
    <div className="h-screen w-screen overflow-hidden flex select-none transition-colors duration-200 bg-canvas text-ink">
      {/* Keyed on settings/workspace state so the 260ms morph replays on each
          transition between the Main Workspace and the Settings Workspace. */}
      {isSettingsOpen ? (
        <div
          key="settings"
          className="workspace-fade-slide flex-1 h-full min-w-0"
        >
          <SettingsView />
        </div>
      ) : (
        <div
          key="workspace"
          className="workspace-fade-slide flex-1 h-full min-w-0 flex"
        >
          {/* Left Navigation Sidebar */}
          <KaraSidebar />

          {/* Center Dynamic Content Workspace */}
          <main className="flex-1 h-full min-w-0 overflow-y-auto bg-canvas transition-colors duration-200">
            <div className="max-w-[1560px] w-full mx-auto p-5 md:p-7 lg:p-8 space-y-6">
              {mounted ? renderActiveView() : children}
            </div>
          </main>

          {/* Right Agent Assistant Panel */}
          <AgentPanel />
        </div>
      )}

      {/* Theme Color Profiles Modal (global) */}
      <ThemeSettingsModal />
    </div>
  );
}
