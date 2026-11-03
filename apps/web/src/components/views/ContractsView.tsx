"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { BreadcrumbHeader } from "../layout/BreadcrumbHeader";
import { PillButton } from "../ui/PillButton";
import { StatusBadge, BadgeVariant } from "../ui/StatusBadge";
import { ProgressBar } from "../ui/ProgressBar";
import { AvatarStack } from "../ui/AvatarStack";
import { useWorkspaceStore } from "../../lib/store";

interface ContractRow {
  id: string;
  name: string;
  type: string;
  initials: string;
  avatarBg: string;
  annualValue: string;
  renewalDate: string;
  noticeInfo?: string;
  obligationsCurrent: number;
  obligationsTotal: number;
  health: "Good" | "At risk" | "Attention";
  badgeVariant: BadgeVariant;
  owners: { name: string; initials: string; color: string }[];
}

export function ContractsView() {
  const { setSelectedVendor, setActiveModule } = useWorkspaceStore();
  const [filterSearch, setFilterSearch] = useState("");

  const contracts: ContractRow[] = [
    {
      id: "cnt-1",
      name: "Concerted Print",
      type: "Print and media agreement",
      initials: "C",
      avatarBg: "bg-slate-700",
      annualValue: "$42K",
      renewalDate: "Nov 30, 2026",
      obligationsCurrent: 5,
      obligationsTotal: 5,
      health: "Good",
      badgeVariant: "good",
      owners: [{ name: "Alex Chen", initials: "AC", color: "bg-indigo-600" }],
    },
    {
      id: "cnt-2",
      name: "Sterk Networks",
      type: "Network services agreement",
      initials: "S",
      avatarBg: "bg-rose-700",
      annualValue: "$250K",
      renewalDate: "Dec 17, 2026",
      noticeInfo: "Notice due in 14 days",
      obligationsCurrent: 8,
      obligationsTotal: 11,
      health: "At risk",
      badgeVariant: "at-risk",
      owners: [
        { name: "Sara V.", initials: "SV", color: "bg-emerald-600" },
        { name: "John D.", initials: "JD", color: "bg-blue-600" },
      ],
    },
    {
      id: "cnt-3",
      name: "Query Cloud",
      type: "Master services agreement",
      initials: "Q",
      avatarBg: "bg-neutral-900",
      annualValue: "$450K",
      renewalDate: "Jan 1, 2027",
      noticeInfo: "Service credit pending",
      obligationsCurrent: 12,
      obligationsTotal: 18,
      health: "Attention",
      badgeVariant: "attention",
      owners: [{ name: "Helena Derwent", initials: "HD", color: "bg-amber-600" }],
    },
    {
      id: "cnt-4",
      name: "Larlana Facilities",
      type: "Maintenance agreement",
      initials: "L",
      avatarBg: "bg-purple-700",
      annualValue: "$154K",
      renewalDate: "Feb 14, 2027",
      obligationsCurrent: 11,
      obligationsTotal: 11,
      health: "Good",
      badgeVariant: "good",
      owners: [{ name: "Marcus Reed", initials: "MR", color: "bg-cyan-600" }],
    },
    {
      id: "cnt-5",
      name: "Fleafix Freight",
      type: "Carrier solutions agreement",
      initials: "F",
      avatarBg: "bg-amber-700",
      annualValue: "$1.2M",
      renewalDate: "Mar 31, 2027",
      obligationsCurrent: 14,
      obligationsTotal: 14,
      health: "Attention",
      badgeVariant: "attention",
      owners: [{ name: "Elena Rostova", initials: "ER", color: "bg-violet-600" }],
    },
    {
      id: "cnt-6",
      name: "Helani Security",
      type: "Managed security services",
      initials: "H",
      avatarBg: "bg-blue-700",
      annualValue: "$130K",
      renewalDate: "Apr 20, 2027",
      obligationsCurrent: 6,
      obligationsTotal: 8,
      health: "Good",
      badgeVariant: "good",
      owners: [{ name: "Subash K.", initials: "SK", color: "bg-emerald-600" }],
    },
    {
      id: "cnt-7",
      name: "Allison & Brannock LLP",
      type: "Legal retainer",
      initials: "A",
      avatarBg: "bg-slate-800",
      annualValue: "$60K",
      renewalDate: "May 31, 2027",
      obligationsCurrent: 8,
      obligationsTotal: 8,
      health: "Good",
      badgeVariant: "good",
      owners: [
        { name: "Celestine A.", initials: "CA", color: "bg-rose-600" },
        { name: "David M.", initials: "DM", color: "bg-indigo-600" },
      ],
    },
    {
      id: "cnt-8",
      name: "Manegold Payroll",
      type: "Payroll services agreement",
      initials: "M",
      avatarBg: "bg-teal-700",
      annualValue: "$99K",
      renewalDate: "Jun 30, 2027",
      obligationsCurrent: 10,
      obligationsTotal: 10,
      health: "Good",
      badgeVariant: "good",
      owners: [{ name: "Helena Derwent", initials: "HD", color: "bg-amber-600" }],
    },
    {
      id: "cnt-9",
      name: "Sheffield Data",
      type: "Analytics subscription",
      initials: "S",
      avatarBg: "bg-cyan-800",
      annualValue: "$320K",
      renewalDate: "Sep 1, 2027",
      obligationsCurrent: 8,
      obligationsTotal: 9,
      health: "Attention",
      badgeVariant: "attention",
      owners: [{ name: "Alex Chen", initials: "AC", color: "bg-indigo-600" }],
    },
  ];

  const handleRowClick = (contract: ContractRow) => {
    setSelectedVendor(contract.name);
    if (contract.name === "Query Cloud") {
      setActiveModule("obligations");
    } else {
      setActiveModule("vetted");
    }
  };

  return (
    <div className="space-y-6">
      <BreadcrumbHeader
        breadcrumbs={[{ label: "Contracts" }, { label: "All contracts" }]}
        title="Contracts"
        subtitle="49 active contracts worth $6.2M a year. 0 renew in the next 90 days."
        actions={
          <div className="flex items-center gap-2">
            <PillButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Import contract
            </PillButton>
          </div>
        }
      />

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] shadow-xs overflow-hidden">
        {/* Table Subheader Bar */}
        <div className="px-5 py-3 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-neutral-900 dark:text-white">
              All contracts ({contracts.length})
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
              — Sorted by renewal date, soonest first
            </span>
          </div>
          <button className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Customize view</span>
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/5 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="py-2.5 px-5 font-medium">Name</th>
                <th className="py-2.5 px-4 font-medium">Annual Value</th>
                <th className="py-2.5 px-4 font-medium">Renews</th>
                <th className="py-2.5 px-4 font-medium">Obligations</th>
                <th className="py-2.5 px-4 font-medium">Health</th>
                <th className="py-2.5 px-5 font-medium text-right">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {contracts.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => handleRowClick(c)}
                  className="hover:bg-slate-50/70 dark:hover:bg-white/2 transition cursor-pointer group"
                >
                  {/* Name and Agreement */}
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${c.avatarBg}`}
                      >
                        {c.initials}
                      </div>
                      <div>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {c.name}
                        </span>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                          {c.type}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Annual Value (Tabular Mono Figures) */}
                  <td className="py-3 px-4 font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                    {c.annualValue}
                  </td>

                  {/* Renewal Date */}
                  <td className="py-3 px-4">
                    <span className="text-slate-700 dark:text-zinc-300 font-medium">
                      {c.renewalDate}
                    </span>
                    {c.noticeInfo && (
                      <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                        {c.noticeInfo}
                      </span>
                    )}
                  </td>

                  {/* Obligations Progress */}
                  <td className="py-3 px-4">
                    <ProgressBar
                      current={c.obligationsCurrent}
                      total={c.obligationsTotal}
                      status={
                        c.health === "Good"
                          ? "good"
                          : c.health === "Attention"
                          ? "warning"
                          : "danger"
                      }
                    />
                  </td>

                  {/* Health Status Pill */}
                  <td className="py-3 px-4">
                    <StatusBadge variant={c.badgeVariant} dot>
                      {c.health}
                    </StatusBadge>
                  </td>

                  {/* Owner Stack */}
                  <td className="py-3 px-5 text-right">
                    <div className="inline-block">
                      <AvatarStack users={c.owners} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-5 py-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-50/30 dark:bg-white/1">
          <span>Showing 9 of 49 contracts</span>
          <button className="text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white cursor-pointer">
            Show more
          </button>
        </div>
      </div>
    </div>
  );
}

