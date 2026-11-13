import { create } from "zustand";
import {
  Sun,
  Moon,
  Leaf,
  Flower2,
  Ghost,
  Snowflake,
  Code2,
  type LucideIcon,
} from "lucide-react";

export type NavModule =
  | "overview"
  | "alerts"
  | "contracts"
  | "obligations"
  | "vetted"
  | "approvals"
  | "meetings"
  | "tasks"
  | "crm"
  | "chat";

export type AppTheme = "light" | "dark";

/* ------------------------------------------------------------------ */
/* Theme Profiles Engine                                              */
/* ------------------------------------------------------------------ */

export type ThemeProfile =
  | "kara-light"
  | "kara-dark"
  | "claude"
  | "catppuccin"
  | "dracula"
  | "nord"
  | "monokai";

export interface ThemeProfileMeta {
  id: ThemeProfile;
  name: string;
  tagline: string;
  icon: LucideIcon;
  mode: "light" | "dark";
  /** canvas, surface, accent — for live preview chips */
  swatch: [string, string, string];
}

export const DEFAULT_THEME_PROFILE: ThemeProfile = "kara-light";
export const THEME_STORAGE_KEY = "kara-theme-profile";

export const THEME_PROFILES: ThemeProfileMeta[] = [
  {
    id: "kara-light",
    name: "Kara Light",
    tagline: "Calm porcelain default",
    icon: Sun,
    mode: "light",
    swatch: ["#F8F9FC", "#FFFFFF", "#816797"],
  },
  {
    id: "kara-dark",
    name: "Obsidian Dark",
    tagline: "Kara midnight studio",
    icon: Moon,
    mode: "dark",
    swatch: ["#0B0E14", "#131922", "#A5C9CA"],
  },
  {
    id: "claude",
    name: "Claude",
    tagline: "Warm ivory & terracotta",
    icon: Leaf,
    mode: "light",
    swatch: ["#FBF9F5", "#FFFFFF", "#D97757"],
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    tagline: "Latte soft pastel",
    icon: Flower2,
    mode: "light",
    swatch: ["#EFF1F5", "#FFFFFF", "#8839EF"],
  },
  {
    id: "dracula",
    name: "Dracula",
    tagline: "Vampiric vibrant dark",
    icon: Ghost,
    mode: "dark",
    swatch: ["#21222C", "#282A36", "#FF79C6"],
  },
  {
    id: "nord",
    name: "Nord",
    tagline: "Arctic slate & frost",
    icon: Snowflake,
    mode: "dark",
    swatch: ["#2E3440", "#3B4252", "#88C0D0"],
  },
  {
    id: "monokai",
    name: "Monokai",
    tagline: "High-contrast code editor",
    icon: Code2,
    mode: "dark",
    swatch: ["#1E1F1C", "#272822", "#FD971F"],
  },
];

/** Applies the data-theme attribute + legacy `.dark` class bridge. */
export function applyThemeProfile(profile: ThemeProfile): void {
  if (typeof document === "undefined") return;
  const meta = THEME_PROFILES.find((p) => p.id === profile);
  document.documentElement.setAttribute("data-theme", profile);
  document.documentElement.classList.toggle("dark", meta?.mode === "dark");
}

/** Reads the persisted profile, guarding against tampered values. */
export function readStoredThemeProfile(): ThemeProfile {
  if (typeof window === "undefined") return DEFAULT_THEME_PROFILE;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEME_PROFILES.some((p) => p.id === stored)
    ? (stored as ThemeProfile)
    : DEFAULT_THEME_PROFILE;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/* Dedicated Settings Workspace                                       */
/* ------------------------------------------------------------------ */

export type SettingsTab =
  | "profile"
  | "appearance"
  | "workspace"
  | "engines"
  | "integrations";

interface WorkspaceState {
  theme: AppTheme;
  themeProfile: ThemeProfile;
  isThemeSettingsOpen: boolean;
  isAgentOpen: boolean;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  activeSettingsTab: SettingsTab;
  activeNav: string;
  activeModule: NavModule;
  selectedVendor: string;
  secondaryFilter: string;
  searchQuery: string;
  chartMetric: "total" | "impact";
  timeView: "daily" | "weekly" | "monthly";
  chatMessages: ChatMessage[];
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  setThemeProfile: (profile: ThemeProfile) => void;
  setThemeSettingsOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean, tab?: SettingsTab) => void;
  setActiveSettingsTab: (tab: SettingsTab) => void;
  toggleAgent: () => void;
  toggleSidebar: () => void;
  setActiveNav: (nav: string) => void;
  setActiveModule: (module: NavModule) => void;
  setSelectedVendor: (vendor: string) => void;
  setSecondaryFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  setChartMetric: (metric: "total" | "impact") => void;
  setTimeView: (view: "daily" | "weekly" | "monthly") => void;
  sendChatMessage: (text: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  theme: "light",
  themeProfile: DEFAULT_THEME_PROFILE,
  isThemeSettingsOpen: false,
  isAgentOpen: true,
  isSidebarOpen: true,
  isSettingsOpen: false,
  activeSettingsTab: "appearance",
  activeNav: "goals",
  activeModule: "overview",
  selectedVendor: "Lanternfish",
  secondaryFilter: "open",
  searchQuery: "",
  chartMetric: "total",
  timeView: "monthly",
  chatMessages: [
    {
      id: "msg-1",
      sender: "agent",
      text: "Good morning, Alex! You can ask me anything about Kara AI. Meeting intelligence currently covers 15,612 ingested sessions with 1,428 action items in flight.",
      timestamp: "9:00 AM",
    },
  ],

  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => {
      const nextProfile: ThemeProfile =
        state.themeProfile === "kara-light" ? "kara-dark" : "kara-light";
      const nextTheme: AppTheme =
        THEME_PROFILES.find((p) => p.id === nextProfile)!.mode;
      applyThemeProfile(nextProfile);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextProfile);
      }
      return { themeProfile: nextProfile, theme: nextTheme };
    }),
  setThemeProfile: (profile) => {
    const meta = THEME_PROFILES.find((p) => p.id === profile);
    applyThemeProfile(profile);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, profile);
    }
    set({ themeProfile: profile, theme: meta?.mode ?? "light" });
  },
  setThemeSettingsOpen: (isThemeSettingsOpen) => set({ isThemeSettingsOpen }),
  setSettingsOpen: (isSettingsOpen, tab) =>
    set((state) => ({
      isSettingsOpen,
      activeSettingsTab: tab ?? state.activeSettingsTab,
    })),
  setActiveSettingsTab: (activeSettingsTab) => set({ activeSettingsTab }),
  toggleAgent: () => set((state) => ({ isAgentOpen: !state.isAgentOpen })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveNav: (activeNav) => set({ activeNav }),
  setActiveModule: (activeModule) => set({ activeModule }),
  setSelectedVendor: (selectedVendor) => set({ selectedVendor }),
  setSecondaryFilter: (secondaryFilter) => set({ secondaryFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setChartMetric: (chartMetric) => set({ chartMetric }),
  setTimeView: (timeView) => set({ timeView }),
  sendChatMessage: (text) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          id: `msg-${Date.now()}`,
          sender: "user",
          text,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        {
          id: `msg-${Date.now() + 1}`,
          sender: "agent",
          text: `Analyzing "${text}" across 15,612 ingested meetings, 1,428 action items, and $780K tracked CRM value...`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    })),
}));
