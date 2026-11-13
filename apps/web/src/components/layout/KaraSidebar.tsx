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
  Cpu,
  Server,
  ChevronsUpDown,
  LayoutDashboard,
  Bell,
  ChevronDown,
  User,
  Palette,
  Settings,
  KeyRound,
  LogOut,
} from "lucide-react";
import { useWorkspaceStore, type SettingsTab } from "../../lib/store";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: number;
  pulse?: boolean;
  onClick?: () => void;
}

function SectionGroup({
  title,
  items,
  activeNav,
  onNavClick,
}: {
  title: string;
  items: NavItem[];
  activeNav: string;
  onNavClick: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      <span className="px-2.5 text-label-sm font-albert font-semibold tracking-[0.08em] text-ink-muted uppercase">
        {title}
      </span>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={item.onClick ?? (() => onNavClick(item.id))}
              className={clsx(
                "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-body-base font-albert transition-all duration-200 ease-out cursor-pointer",
                isActive
                  ? "bg-card border border-line-strong text-ink font-medium shadow-2xs"
                  : "border border-transparent text-ink-secondary hover:text-ink hover:bg-hovered/60"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={clsx(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-accent" : "text-ink-muted"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-accent text-on-accent shrink-0">
                  {item.badge}
                </span>
              )}
              {item.pulse && (
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
              )}
              {item.count !== undefined && (
                <span className="text-[10px] font-mono text-ink-muted shrink-0">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ProfileMenuItem {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const profileMenuItems: ProfileMenuItem[] = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "appearance", label: "Appearance & Themes", icon: Palette },
  { id: "workspace", label: "Workspace Settings", icon: Settings },
  { id: "engines", label: "AI Engine & API Keys", icon: KeyRound },
];

export function KaraSidebar() {
  const { activeNav, setActiveNav, isSidebarOpen, setActiveModule, setSettingsOpen } =
    useWorkspaceStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const coreItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "meetings", label: "Live Audio & Bots", icon: Video, pulse: true },
    { id: "moms", label: "Decisions & MOM", icon: FileText },
    { id: "contracts", label: "Twenty CRM Sync", icon: Database, count: 49 },
    { id: "tasks", label: "Kanban Task OS", icon: KanbanSquare, count: 142 },
  ];

  const intelligenceItems: NavItem[] = [
    { id: "chat", label: "Executive RAG Assistant", icon: Sparkles, badge: "AI" },
    { id: "transcripts", label: "Diarized Transcripts", icon: Radio },
    { id: "alerts", label: "Decision Alerts", icon: Bell, count: 7 },
  ];

  if (!isSidebarOpen) return null;

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    if (id === "overview") setActiveModule("overview");
    else if (id === "meetings" || id === "moms" || id === "transcripts")
      setActiveModule("meetings");
    else if (id === "tasks") setActiveModule("tasks");
    else if (id === "contracts") setActiveModule("contracts");
    else if (id === "alerts") setActiveModule("alerts");
    else if (id === "chat") setActiveModule("chat");
  };

  const handleSettingsClick = (tab: SettingsTab) => {
    setProfileMenuOpen(false);
    setSettingsOpen(true, tab);
  };

  return (
    <aside className="w-60 lg:w-64 shrink-0 h-full flex flex-col justify-between py-4 px-3 border-r border-line bg-canvas text-ink-secondary select-none overflow-y-auto transition-colors duration-200">
      <div className="space-y-5">
        {/* Workspace Brand Dropdown */}
        <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-card border border-line cursor-pointer hover:border-line-strong transition shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[var(--chart-1)] to-[var(--chart-2)] flex items-center justify-center text-[var(--on-accent)] font-unbounded text-xs font-bold shadow-sm">
              K
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-unbounded text-xs font-bold tracking-tight text-ink flex items-center gap-1.5">
                Kara AI
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-medium bg-accent-soft text-accent border border-accent/30">
                  OS
                </span>
              </span>
              <span className="font-albert text-[10px] text-ink-muted truncate">
                Chief of Staff Engine
              </span>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-ink-muted shrink-0" />
        </div>

        {/* Navigation Section Groups — operational workflows only */}
        <SectionGroup
          title="Core Workspace"
          items={coreItems}
          activeNav={activeNav}
          onNavClick={handleNavClick}
        />
        <SectionGroup
          title="Chief Intelligence"
          items={intelligenceItems}
          activeNav={activeNav}
          onNavClick={handleNavClick}
        />
      </div>

      {/* Bottom User Profile Card + animated dropdown menu */}
      <div className="pt-4 border-t border-line">
        {/* Click-outside catcher */}
        {profileMenuOpen && (
          <button
            aria-label="Close profile menu"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setProfileMenuOpen(false)}
          />
        )}

        <div className="relative z-40">
          {/* Animated Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="profile-dropdown-enter absolute bottom-full mb-2 left-0 w-56 rounded-xl bg-card border border-line shadow-xl overflow-hidden py-1.5">
              <span className="px-3 pt-1 pb-1.5 block text-[10px] font-albert font-semibold tracking-[0.08em] text-ink-muted uppercase">
                Account
              </span>
              {profileMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSettingsClick(item.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-body-base font-albert text-ink-secondary hover:text-ink hover:bg-hovered transition-colors duration-150 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-ink-muted" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
              <div className="my-1 border-t border-line" />
              <button
                onClick={() => setProfileMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-body-base font-albert text-ink-muted hover:text-ink hover:bg-hovered transition-colors duration-150 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Profile Card (toggles the menu) */}
          <button
            onClick={() => setProfileMenuOpen((open) => !open)}
            className={clsx(
              "w-full flex items-center justify-between p-2 rounded-xl bg-card border shadow-2xs transition-all duration-200 ease-out cursor-pointer",
              profileMenuOpen
                ? "border-line-strong"
                : "border-line hover:border-line-strong"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-unbounded text-[11px] font-bold shrink-0">
                AC
              </div>
              <div className="flex flex-col min-w-0 items-start">
                <span className="font-albert text-xs font-semibold text-ink truncate">
                  Alex Chen
                </span>
                <span className="font-albert text-[10px] text-ink-muted truncate">
                  Head of Product · Owner
                </span>
              </div>
            </div>
            <ChevronDown
              className={clsx(
                "w-3.5 h-3.5 text-ink-muted shrink-0 transition-transform duration-200",
                profileMenuOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Compact engine status row */}
        <div className="flex items-center justify-between px-2.5 pt-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-muted">
            <Cpu className="w-3 h-3" />
            <span>Laya 33ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-muted">
            <Server className="w-3 h-3" />
            <span>PG 18 MVCC</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
