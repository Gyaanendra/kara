"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MessageSquare,
  Send,
  Building2,
  Globe,
  MapPin,
  Shield,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { BreadcrumbHeader } from "../layout/BreadcrumbHeader";
import { PillButton } from "../ui/PillButton";
import { StatusBadge } from "../ui/StatusBadge";
import { useWorkspaceStore } from "../../lib/store";

export function ActivityAuditView() {
  const { setActiveModule, selectedVendor } = useWorkspaceStore();
  const [timelineFilter, setTimelineFilter] = useState("all");

  return (
    <div className="space-y-6">
      <BreadcrumbHeader
        breadcrumbs={[
          { label: "Reviews", onClick: () => setActiveModule("contracts") },
          { label: selectedVendor },
          { label: "Activity" },
        ]}
        title={selectedVendor}
        subtitle="Owner: Sarah Jenkins • Category: AI Customer Support • Contract: $125K / yr"
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge variant="under-review" dot>
              Under review
            </StatusBadge>
            <PillButton
              variant="secondary"
              size="sm"
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Message vendor
            </PillButton>
            <PillButton
              variant="primary"
              size="sm"
              onClick={() => setActiveModule("approvals")}
            >
              Review Approvals →
            </PillButton>
          </div>
        }
      />

      {/* 2-Column Layout (Center Activity Stream + Right Vendor Facts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Center: Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 w-fit text-xs">
            {["all", "reviews", "documents", "vendor"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimelineFilter(tab)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                  timelineFilter === tab
                    ? "bg-white text-neutral-900 shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Timeline Feed Container */}
          <div className="space-y-6 pt-1">
            {/* Group 1: Yesterday */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Oct 8 (Yesterday)
              </span>

              {/* Event 1 */}
              <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-4 shadow-xs flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                      AI suggested a renewal reminder
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                      10:20 AM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Kara AI analyzed contract Section 4.1 notice timeline and queued an
                    automated reminder for Finance 60 days before expiration.
                  </p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="rounded-xl border border-rose-200/70 dark:border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/10 p-4 shadow-xs flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                      Legal review due date passed — DPA
                    </span>
                    <span className="text-[10px] font-mono text-rose-500">2:15 PM</span>
                  </div>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 leading-relaxed">
                    Data Processing Addendum was due for review on Oct 6. Celestine Abara
                    notified to expedite.
                  </p>
                </div>
              </div>
            </div>

            {/* Group 2: Oct 5 */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Oct 5 (Wednesday)
              </span>

              {/* Event 3 */}
              <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-4 shadow-xs flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                      Security review approved
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                      11:45 AM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    SOC 2 Type II and penetration test verified by Subash Kallenberg. Zero
                    material non-conformities found.
                  </p>
                </div>
              </div>

              {/* Event 4 */}
              <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-4 shadow-xs flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                      SOC 2 DPA documentation uploaded
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                      9:00 AM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Uploaded by vendor team:{" "}
                    <span className="underline font-mono text-blue-600 dark:text-blue-400 cursor-pointer">
                      Lanternfish_SOC2_2026.pdf
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Vendor Facts & Progress Checklist (1 Col) */}
        <div className="space-y-4">
          {/* Vendor Facts Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-5 shadow-xs space-y-3.5">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white pb-2 border-b border-slate-100 dark:border-white/5">
              Vendor Facts
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Website</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  lanternfish.ai
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">HQ</span>
                <span className="text-neutral-800 dark:text-zinc-200">
                  Toronto, Canada
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Category</span>
                <span className="text-neutral-800 dark:text-zinc-200">
                  AI Customer Support
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Data access</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Customer data
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Contract</span>
                <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                  $125,000 / year
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Term</span>
                <span className="text-neutral-800 dark:text-zinc-200">2 years</span>
              </div>
            </div>
          </div>

          {/* Section Progress Checklist */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white pb-2 border-b border-slate-100 dark:border-white/5">
              Review Progress
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Requirements</span>
                <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  9 / 12
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Security</span>
                <StatusBadge variant="good">Approved</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Legal</span>
                <StatusBadge variant="attention">In review</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Compliance</span>
                <StatusBadge variant="good">Complete</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Finance</span>
                <StatusBadge variant="neutral">Pending</StatusBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

