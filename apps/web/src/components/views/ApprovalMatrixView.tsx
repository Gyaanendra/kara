"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  Building,
  DollarSign,
  UserCheck,
  Sparkles,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { BreadcrumbHeader } from "../layout/BreadcrumbHeader";
import { PillButton } from "../ui/PillButton";
import { StatusBadge } from "../ui/StatusBadge";
import { AvatarStack } from "../ui/AvatarStack";
import { useWorkspaceStore } from "../../lib/store";

export function ApprovalMatrixView() {
  const { setActiveModule, selectedVendor } = useWorkspaceStore();
  const [isApproved, setIsApproved] = useState(false);

  const checks = [
    {
      id: "chk-1",
      name: "Company",
      description: "Entity verification & sanction screen",
      status: "Approved",
      owner: "Sarah Jenkins",
      date: "Oct 1",
    },
    {
      id: "chk-2",
      name: "Security",
      description: "SOC 2 Type II, cloud security review",
      status: "Approved",
      owner: "Subash Kallenberg",
      date: "Oct 5",
    },
    {
      id: "chk-3",
      name: "Legal",
      description: "MSA & DPA redlines completed",
      status: "Approved",
      owner: "Celestine Abara",
      date: "Oct 11",
    },
    {
      id: "chk-4",
      name: "Compliance",
      description: "GDPR / CCPA data residency checked",
      status: "Approved",
      owner: "Marcus Reed",
      date: "Oct 12",
    },
    {
      id: "chk-5",
      name: "Finance",
      description: "Budget approved & PO line allocated",
      status: "Approved",
      owner: "Helena Derwent",
      date: "Oct 13",
    },
  ];

  const followUps = [
    { name: "SOC 2 bridge letter", dueDate: "Dec 31, 2026" },
    { name: "Annual penetration test update", dueDate: "Mar 31, 2027" },
    { name: "Certificate of insurance renewal", dueDate: "Oct 15, 2027" },
  ];

  const auditTrail = [
    {
      title: "Procurement approved contract at $125k/yr",
      actor: "Sarah Jenkins",
      date: "Oct 14, 10:00 AM",
    },
    {
      title: "Verified payment & billing cadence",
      actor: "Helena Derwent",
      date: "Oct 13, 3:30 PM",
    },
    {
      title: "Approved negotiated DPA & liability caps",
      actor: "Celestine Abara",
      date: "Oct 11, 4:15 PM",
    },
    {
      title: "SOC 2 Certificate & audit report cleared",
      actor: "Subash Kallenberg",
      date: "Oct 8, 11:45 AM",
    },
    {
      title: "Completed initial compliance risk tiering",
      actor: "Marcus Reed",
      date: "Oct 2, 9:20 AM",
    },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbHeader
        breadcrumbs={[
          { label: "Reviews", onClick: () => setActiveModule("contracts") },
          { label: selectedVendor, onClick: () => setActiveModule("vetted") },
          { label: "Final approval" },
        ]}
        title="Final approval"
        subtitle={`${selectedVendor} — 2 yr term • All 5 required enterprise checks verified`}
        actions={
          <div className="flex items-center gap-2">
            <PillButton variant="ghost" size="sm">
              Save draft
            </PillButton>
            <PillButton
              variant={isApproved ? "emerald" : "emerald"}
              size="sm"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => setIsApproved(true)}
            >
              {isApproved ? "Vendor Approved ✓" : "Approve vendor"}
            </PillButton>
          </div>
        }
      />

      {/* 3-Column Decision Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Checks Matrix (1 Col) */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
                Checks (5 of 5 complete)
              </h3>
              <StatusBadge variant="good" dot>
                All Passed
              </StatusBadge>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {checks.map((chk) => (
                <div key={chk.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {chk.name}
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {chk.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge variant="good">Approved</StatusBadge>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                      {chk.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Obligations */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white pb-2 border-b border-slate-100 dark:border-white/5">
              Follow-up Obligations
            </h4>
            <div className="space-y-2 text-xs">
              {followUps.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                  <span className="text-[11px]">{item.name}</span>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
                    Due {item.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Approval Summary & Audit Trail (1 Col) */}
        <div className="space-y-5">
          {/* Summary Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-5 shadow-xs space-y-3.5">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white pb-2 border-b border-slate-100 dark:border-white/5">
              Approval Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Product</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Lanternfish AI
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Cost</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  $125,000 / year
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Term</span>
                <span className="text-neutral-800 dark:text-zinc-200">2 years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Data access</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Customer data
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                <span className="text-slate-400 dark:text-zinc-500">Approvers</span>
                <AvatarStack
                  users={[
                    { name: "Sarah Jenkins", initials: "SJ", color: "bg-indigo-600" },
                    { name: "Celestine Abara", initials: "CA", color: "bg-rose-600" },
                    { name: "Helena Derwent", initials: "HD", color: "bg-amber-600" },
                  ]}
                  count={4}
                />
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white pb-2 border-b border-slate-100 dark:border-white/5">
              Audit Trail
            </h4>

            <div className="space-y-3 text-xs">
              {auditTrail.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-neutral-900 dark:text-zinc-200">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    <span>{item.actor}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Automated Post-Approval Workflows (1 Col) */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
                On Approval (Automated Workflows)
              </h3>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
              When approved, Kara Autonomous OS immediately executes the following multi-system
              tasks:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    Vendor Status moves to Active
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Auto-publishes to company procurement catalog
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    Supplier created in Twenty CRM
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Creates native PostgreSQL JSONB record with GIN index
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    Renewal review queued for Oct 2027
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Places automated action item into Notion Kanban Task OS
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    Bot invited to Quarterly Business Reviews
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Connects calendar webhook for meeting recording & transcription
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveModule("tasks")}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition text-center cursor-pointer"
              >
                View Kanban Board Tasks →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

