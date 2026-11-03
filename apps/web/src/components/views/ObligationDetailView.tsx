"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Sparkles,
  FileText,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Share2,
  Send,
  Building2,
  Calendar,
} from "lucide-react";
import { BreadcrumbHeader } from "../layout/BreadcrumbHeader";
import { PillButton } from "../ui/PillButton";
import { StatusBadge } from "../ui/StatusBadge";
import { useWorkspaceStore } from "../../lib/store";

export function ObligationDetailView() {
  const { setActiveModule, setSelectedVendor } = useWorkspaceStore();
  const [claimStatus, setClaimStatus] = useState<"ready" | "created">("ready");

  const handleCreateClaim = () => {
    setClaimStatus("created");
  };

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb and Actions */}
      <BreadcrumbHeader
        breadcrumbs={[
          { label: "Obligations", onClick: () => setActiveModule("contracts") },
          { label: "Query Cloud", onClick: () => setSelectedVendor("Query Cloud") },
          { label: "Service credit" },
        ]}
        title="Service credit"
        subtitle="Query Cloud — Master Services Agreement — September 2026 • Owner: Helena Derwent, Finance • Detected Oct 02"
        actions={
          <div className="flex items-center gap-2">
            <PillButton variant="ghost" size="sm">
              Dismiss
            </PillButton>
            <PillButton variant="secondary" size="sm">
              Assign to finance
            </PillButton>
            <PillButton
              variant={claimStatus === "created" ? "emerald" : "primary"}
              size="sm"
              icon={
                claimStatus === "created" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )
              }
              onClick={handleCreateClaim}
            >
              {claimStatus === "created" ? "Claim Created ($12,500)" : "Create claim"}
            </PillButton>
          </div>
        }
      />

      {/* 3 Metric Cards side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Per contract spec
          </span>
          <div className="text-3xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
            99.9%
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            Monthly uptime target (Section 9.2)
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            What happened
          </span>
          <div className="text-3xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
            99.2%
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            September uptime: 0.7% under target. Query vendor report
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/15 p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
            What you can claim
          </span>
          <div className="text-3xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            $12,500
          </div>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 flex items-center gap-1">
            <span>25% of September — was $50,000</span>
            <span className="text-[10px] font-mono underline cursor-pointer">
              Section 9.2
            </span>
          </p>
        </div>
      </div>

      {/* Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Grounded AI Finding (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
                AI finding & Grounded Evidence
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
              Detected Oct 2 from vendor telemetry
            </span>
          </div>

          <p className="text-xs text-neutral-800 dark:text-zinc-200 leading-relaxed">
            September uptime was below the contractual threshold. Based on{" "}
            <strong>Section 9.2</strong>, Kettlebrook Foods is eligible for a{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              $12,500
            </span>{" "}
            service credit on the upcoming invoice.
          </p>

          {/* Cited Evidence Block */}
          <div className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-white">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Section 9.2 — Service Credits
              </span>
              <button className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer">
                <span>View clause in PDF</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <blockquote className="text-[11px] text-slate-600 dark:text-zinc-300 italic border-l-2 border-indigo-400 pl-3 leading-relaxed">
              &ldquo;If Monthly Uptime is below 99.9%, Client may claim a credit of
              25.00% of the Fees for the month ($12,500). If Uptime is below 99.0%, the
              credit is 50%, and for 95% or below, 100%. Claims must be submitted within
              30 days of month close.&rdquo;
            </blockquote>
          </div>

          {/* Timeline & Previous Occurrences */}
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-100/60 dark:bg-white/5 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500">
                Claim Deadline
              </span>
              <p className="font-semibold text-neutral-900 dark:text-white font-mono">
                Closes Oct 22 (Section 9.4)
              </p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400">
                18 days remaining to claim
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-100/60 dark:bg-white/5 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500">
                Historical Precedent
              </span>
              <p className="font-semibold text-neutral-900 dark:text-white font-mono">
                Same breach in August ($6,400)
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Credit applied on Sep 1 billing
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Metadata Details (1 Col) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold text-neutral-900 dark:text-white pb-3 border-b border-slate-100 dark:border-white/5">
            Contract & Finding Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Vendor</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                Query Cloud
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Contract</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                MSA, 2025
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Trigger</span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                Uptime below 99.9%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Detected</span>
              <span className="font-mono text-neutral-800 dark:text-zinc-300">
                Oct 2, 2026
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Status</span>
              <StatusBadge variant="good" dot>
                Claim ready
              </StatusBadge>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Owner</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-bold">
                  HD
                </div>
                <span className="font-medium text-neutral-900 dark:text-white text-xs">
                  Helena Derwent
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setActiveModule("approvals")}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition text-center cursor-pointer"
            >
              Go to Final Approvals Matrix →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

