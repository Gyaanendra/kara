"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import {
  ArrowLeft,
  User,
  Palette,
  Building2,
  Cpu,
  Plug,
  Sun,
  Moon,
  Leaf,
  Flower2,
  Ghost,
  Snowflake,
  Code2,
  KeyRound,
  CheckCircle2,
  Mail,
  Globe,
  ChevronRight,
  Database,
  Server,
  FileText,
  BadgeCheck,
  Layers,
} from "lucide-react";
import { useWorkspaceStore, THEME_PROFILES, type SettingsTab } from "../../lib/store";
import { fetchApi } from "../../lib/api";

const FONT_SCALE_KEY = "kara-font-scale";

interface SettingsNavItem {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsNavItems: SettingsNavItem[] = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "appearance", label: "Appearance & Themes", icon: Palette },
  { id: "workspace", label: "Workspace & Team", icon: Building2 },
  { id: "engines", label: "AI Engines & Speech", icon: Cpu },
  { id: "integrations", label: "Integrations (CRM & S3)", icon: Plug },
];

const profileThemeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "kara-light": Sun,
  "kara-dark": Moon,
  claude: Leaf,
  catppuccin: Flower2,
  dracula: Ghost,
  nord: Snowflake,
  monokai: Code2,
};

function Field({
  label,
  value,
  type = "text",
  icon: Icon,
}: {
  label: string;
  value: string;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-label-sm font-albert font-semibold text-ink-muted tracking-wide uppercase">
        {label}
      </span>
      <span className="relative block">
        {Icon && (
          <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
        )}
        <input
          type={type}
          defaultValue={value}
          className={clsx(
            "w-full py-2 rounded-lg bg-subtle border border-line text-body-base font-albert text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors",
            Icon ? "pl-8 pr-3" : "px-3"
          )}
        />
      </span>
    </label>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-line rounded-xl p-5 space-y-4 shadow-2xs">
      {(title || subtitle) && (
        <div>
          {title && (
            <h3 className="font-unbounded text-xs font-bold text-ink">{title}</h3>
          )}
          {subtitle && (
            <p className="font-albert text-[11px] text-ink-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function SettingsView() {
  const {
    setSettingsOpen,
    activeSettingsTab,
    setActiveSettingsTab,
    themeProfile,
    setThemeProfile,
  } = useWorkspaceStore();

  // Fluid font scaling — scales every rem-based size via the root font size.
  const [fontScale, setFontScale] = useState<number>(() => {
    if (typeof window === "undefined") return 100;
    const stored = Number(window.localStorage.getItem(FONT_SCALE_KEY));
    return Number.isFinite(stored) && stored >= 85 && stored <= 115 ? stored : 100;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
    window.localStorage.setItem(FONT_SCALE_KEY, String(fontScale));
  }, [fontScale]);

  // Esc returns to the workspace
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSettingsOpen]);

  // Load registered Sub-Helpers from PostgreSQL API
  const [subHelpers, setSubHelpers] = useState<any[]>([]);
  useEffect(() => {
    fetchApi<any[]>("/ai/sub-helpers")
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setSubHelpers(res);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex bg-canvas text-ink">
      {/* Settings Sidebar */}
      <aside className="w-56 shrink-0 h-full flex flex-col border-r border-line bg-canvas py-4 px-3 space-y-5 overflow-y-auto">
        <button
          onClick={() => setSettingsOpen(false)}
          className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-card border border-line hover:border-line-strong transition-all duration-200 ease-out cursor-pointer text-ink-secondary hover:text-ink text-body-base font-albert font-medium"
        >
          <ArrowLeft className="w-4 h-4 text-ink-muted" />
          <span>Back to Workspace</span>
          <kbd className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-subtle border border-line text-ink-muted">
            Esc
          </kbd>
        </button>

        <div className="space-y-0.5">
          <span className="px-2.5 text-label-sm font-albert font-semibold tracking-[0.08em] text-ink-muted uppercase">
            Settings
          </span>
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSettingsTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSettingsTab(item.id)}
                className={clsx(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-body-base font-albert transition-all duration-200 ease-out cursor-pointer",
                  isActive
                    ? "bg-card border border-line-strong text-ink font-medium shadow-2xs"
                    : "border border-transparent text-ink-secondary hover:text-ink hover:bg-hovered/60"
                )}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={clsx(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-accent" : "text-ink-muted"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {isActive && (
                  <ChevronRight className="w-3 h-3 text-ink-muted shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Settings Content Area */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
          {/* Section header */}
          <div>
            <h1 className="text-header-md font-unbounded font-bold text-ink">
              {settingsNavItems.find((t) => t.id === activeSettingsTab)?.label}
            </h1>
            <p className="font-albert text-body-base text-ink-secondary mt-1">
              {activeSettingsTab === "profile" &&
                "Your identity across the Kara AI workspace."}
              {activeSettingsTab === "appearance" &&
                "One-click re-skins for the entire workspace, applied instantly via CSS variables."}
              {activeSettingsTab === "workspace" &&
                "Workspace identity and team access management."}
              {activeSettingsTab === "engines" &&
                "Speech diarization, LLM routing, and API credentials."}
              {activeSettingsTab === "integrations" &&
                "CRM, object storage, and knowledge sync connections."}
            </p>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Profile                                                    */}
          {/* ---------------------------------------------------------- */}
          {activeSettingsTab === "profile" && (
            <>
              <Card title="Identity">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-unbounded text-lg font-bold">
                    AC
                  </div>
                  <div>
                    <div className="font-albert text-sm font-semibold text-ink">
                      Alex Chen
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-success" />
                      <span className="font-albert text-[11px] text-ink-muted">
                        Head of Product · Workspace Owner
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Full Name" value="Alex Chen" icon={User} />
                  <Field label="Email" value="alex.chen@kara.ai" icon={Mail} />
                  <Field label="Role" value="Head of Product" icon={Building2} />
                  <label className="block space-y-1">
                    <span className="text-label-sm font-albert font-semibold text-ink-muted tracking-wide uppercase">
                      Timezone
                    </span>
                    <span className="relative block">
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
                      <select
                        defaultValue="ist"
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-subtle border border-line text-body-base font-albert text-ink focus:outline-none focus:border-accent transition-colors cursor-pointer appearance-none"
                      >
                        <option value="ist">UTC+05:30 — India Standard Time</option>
                        <option value="utc">UTC+00:00 — Coordinated Universal</option>
                        <option value="est">UTC-05:00 — Eastern Time</option>
                        <option value="pst">UTC-08:00 — Pacific Time</option>
                      </select>
                    </span>
                  </label>
                </div>
              </Card>
            </>
          )}

          {/* ---------------------------------------------------------- */}
          {/* Appearance & Themes                                        */}
          {/* ---------------------------------------------------------- */}
          {activeSettingsTab === "appearance" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {THEME_PROFILES.map((profile) => {
                  const Icon = profileThemeIcons[profile.id] ?? Palette;
                  const isActive = themeProfile === profile.id;
                  return (
                    <button
                      key={profile.id}
                      onClick={() => setThemeProfile(profile.id)}
                      className={clsx(
                        "text-left p-4 rounded-xl bg-card transition-all duration-200 ease-out cursor-pointer space-y-3",
                        isActive
                          ? "border-2 border-accent shadow-md"
                          : "border border-line hover:border-line-strong hover:-translate-y-0.5 hover:shadow-sm"
                      )}
                    >
                      {/* Live colored swatches: canvas / surface / accent */}
                      <div className="flex items-center gap-1.5">
                        {profile.swatch.map((hex, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded-md border border-black/10 shadow-2xs"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                        <Icon
                          className={clsx(
                            "w-4 h-4 ml-auto",
                            isActive ? "text-accent" : "text-ink-muted"
                          )}
                        />
                      </div>
                      <div>
                        <div className="font-albert text-xs font-semibold text-ink">
                          {profile.name}
                        </div>
                        <div className="font-albert text-[10px] text-ink-muted mt-0.5">
                          {profile.tagline}
                        </div>
                      </div>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-accent-soft text-accent border border-accent/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <Card title="Font Scaling" subtitle="Fluid typography across every view (rem-based).">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={85}
                    max={115}
                    step={5}
                    value={fontScale}
                    onChange={(e) => setFontScale(Number(e.target.value))}
                    className="flex-1 cursor-pointer"
                    style={{ accentColor: "var(--accent-primary)" }}
                  />
                  <span className="text-[11px] font-mono text-ink-secondary w-10 text-right">
                    {fontScale}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-subtle border border-line">
                  <span className="text-header-md font-unbounded font-bold text-ink">
                    Kara AI Chief of Staff
                  </span>
                  <p className="font-albert text-body-base text-ink-secondary mt-1">
                    Live typography preview across the workspace.
                  </p>
                </div>
              </Card>
            </>
          )}

          {/* ---------------------------------------------------------- */}
          {/* Workspace & Team                                           */}
          {/* ---------------------------------------------------------- */}
          {activeSettingsTab === "workspace" && (
            <>
              <Card title="Workspace">
                <Field label="Workspace Name" value="Kara AI Workspace" icon={Building2} />
              </Card>
              <Card title="Team Members" subtitle="3 of 10 seats used on the Growth plan.">
                <div className="space-y-2">
                  {[
                    { name: "Alex Chen", role: "Owner", initials: "AC" },
                    { name: "Sarah Chen", role: "Admin", initials: "SC" },
                    { name: "Marcus Reid", role: "Member", initials: "MR" },
                  ].map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-subtle border border-line"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-unbounded text-[11px] font-bold">
                          {member.initials}
                        </div>
                        <span className="font-albert text-xs font-semibold text-ink">
                          {member.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-line text-ink-muted">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* ---------------------------------------------------------- */}
          {/* AI Engines & Speech                                        */}
          {/* ---------------------------------------------------------- */}
          {activeSettingsTab === "engines" && (
            <>
              <Card title="Deepgram Nova-3" subtitle="Diarized speech-to-text with multilingual support.">
                <Field label="API Key" value="sk-dg-••••••••••••••••••••" type="password" icon={KeyRound} />
                <div className="flex items-center gap-2 text-[11px] font-albert text-ink-secondary">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span>Model: nova-3 · Multilingual · Streaming enabled</span>
                </div>
              </Card>
              <Card title="Groq Llama 3.3" subtitle="High-speed reasoning backend for the Chief of Staff RAG.">
                <Field label="API Key" value="gsk-••••••••••••••••••••" type="password" icon={KeyRound} />
                <div className="flex items-center gap-2 text-[11px] font-albert text-ink-secondary">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span>Model: llama-3.3-70b-versatile</span>
                </div>
              </Card>
              <Card title="Laya Decision Router">
                <div className="flex items-center justify-between p-3 rounded-lg bg-subtle border border-line">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                    <span className="font-albert text-xs font-semibold text-ink">
                      Reflex Router — 33ms average
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-soft text-accent border border-accent/30">
                    Active
                  </span>
                </div>
              </Card>

              <Card
                title="Dynamic Sub-Helper Registry"
                subtitle="Modular task-slice workers with sandboxed tool bundles in PostgreSQL 18."
              >
                <div className="space-y-2">
                  {(subHelpers.length > 0
                    ? subHelpers
                    : [
                        {
                          slug: "meeting-researcher",
                          name: "Meeting Intelligence Helper",
                          assignedTools: ["searchMeetingsTool", "getUtterancesTool", "audioScrubTool"],
                        },
                        {
                          slug: "workforce-directory",
                          name: "Workforce & Knowledge Graph Helper",
                          assignedTools: ["directoryLookupTool", "entityGraphTool"],
                        },
                        {
                          slug: "task-executor",
                          name: "Task & Execution Helper",
                          assignedTools: ["extractActionItemsTool", "kanbanCreateTool", "twentyCrmSyncTool"],
                        },
                        {
                          slug: "candidate-evaluator",
                          name: "Candidate & GitHub Audit Helper",
                          assignedTools: ["resumeParserTool", "githubScraperTool", "objectiveScoringTool"],
                        },
                        {
                          slug: "document-generator",
                          name: "Document Drafting Helper",
                          assignedTools: ["templateLoaderTool", "documentRendererTool"],
                        },
                      ]
                  ).map((helper) => (
                    <div
                      key={helper.slug}
                      className="p-2.5 rounded-lg bg-subtle border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-albert text-xs font-semibold text-ink">
                            {helper.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent-soft text-accent border border-accent/20">
                            {helper.slug}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-ink-muted mt-0.5">
                          Tools: {(helper.assignedTools || []).join(", ")}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-success/10 text-success border border-success/20 self-start sm:self-auto">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* ---------------------------------------------------------- */}
          {/* Integrations                                               */}
          {/* ---------------------------------------------------------- */}
          {activeSettingsTab === "integrations" && (
            <>
              {[
                {
                  name: "Twenty CRM",
                  desc: "Two-way sync for deals, contacts, and pipeline value.",
                  icon: Database,
                  status: "Connected",
                },
                {
                  name: "RustFS S3 Audio",
                  desc: "Raw meeting audio object storage with signed deep links.",
                  icon: Server,
                  status: "Connected",
                },
                {
                  name: "Notion Sync",
                  desc: "Push executive MOMs and decisions to your Notion workspace.",
                  icon: FileText,
                  status: "Available",
                },
              ].map((integration) => {
                const Icon = integration.icon;
                const connected = integration.status === "Connected";
                return (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-card border border-line shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={clsx(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          connected
                            ? "bg-accent-soft text-accent"
                            : "bg-subtle text-ink-muted"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-albert text-xs font-semibold text-ink">
                          {integration.name}
                        </div>
                        <div className="font-albert text-[11px] text-ink-muted truncate">
                          {integration.desc}
                        </div>
                      </div>
                    </div>
                    <span
                      className={clsx(
                        "shrink-0 ml-3 text-[10px] font-mono px-2 py-1 rounded border",
                        connected
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-subtle text-ink-muted border-line"
                      )}
                    >
                      {integration.status}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
