import { create } from "zustand";

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

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

interface WorkspaceState {
  theme: AppTheme;
  isAgentOpen: boolean;
  isSidebarOpen: boolean;
  activeNav: string;
  activeModule: NavModule;
  selectedVendor: string;
  secondaryFilter: string;
  searchQuery: string;
  chartMetric: "total" | "impact";
  timeView: "daily" | "weekly";
  chatMessages: ChatMessage[];
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  toggleAgent: () => void;
  toggleSidebar: () => void;
  setActiveNav: (nav: string) => void;
  setActiveModule: (module: NavModule) => void;
  setSelectedVendor: (vendor: string) => void;
  setSecondaryFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  setChartMetric: (metric: "total" | "impact") => void;
  setTimeView: (view: "daily" | "weekly") => void;
  sendChatMessage: (text: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  theme: "dark",
  isAgentOpen: true,
  isSidebarOpen: true,
  activeNav: "goals",
  activeModule: "overview",
  selectedVendor: "Lanternfish",
  secondaryFilter: "open",
  searchQuery: "",
  chartMetric: "total",
  timeView: "daily",
  chatMessages: [
    {
      id: "msg-1",
      sender: "agent",
      text: "Good morning, Yasir! You can ask me anything about Fulcrum. Welcome flows currently drive 34.7% of total conversions ($12,493 impact).",
      timestamp: "9:00 AM",
    },
  ],

  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
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
          text: `Analyzing "${text}" across your 15,612 activated users... Welcome flows currently drive 34.7% of total conversions with $12,493 impact.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    })),
}));
