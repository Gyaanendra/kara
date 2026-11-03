"use client";

import React, { useState } from "react";
import {
  Calendar,
  DollarSign,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Lock,
  SlidersHorizontal,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { BreadcrumbHeader } from "../layout/BreadcrumbHeader";
import { PillButton } from "../ui/PillButton";
import { useWorkspaceStore } from "../../lib/store";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  vendor: string;
  vendorAvatar?: string;
  actionLabel: string;
  actionModule?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  category: "renewal" | "price" | "credit" | "sla" | "insurance" | "security";
}

export function AlertsView() {
  const { setActiveModule, setSelectedVendor } = useWorkspaceStore();
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: "alt-1",
      title: "Renewal notice due in 14 days",
      description:
        "Renews for 12 mos at $21,142.50 on Dec 17 unless notice is sent by Oct 13.",
      vendor: "Sterk Networks",
      actionLabel: "Review renewal",
      icon: Calendar,
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
      category: "renewal",
    },
    {
      id: "alt-2",
      title: "Quote is $24,000 over the price cap",
      description:
        "Quoted $528,000 for 2027. Section 7.2 allows $504,000 at most.",
      vendor: "Query Cloud",
      actionLabel: "Dispute quote",
      icon: DollarSign,
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
      category: "price",
    },
    {
      id: "alt-3",
      title: "Possible $12,500 service credit",
      description:
        "September uptime was 99.2%, below the 99.9% target. Claim by Oct 20.",
      vendor: "Query Cloud",
      actionLabel: "Create claim",
      actionModule: "obligations",
      icon: ShieldCheck,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      category: "credit",
    },
    {
      id: "alt-4",
      title: "Invoice is $12,000 over the price cap",
      description:
        "Billed $216,000 for the renewal term. The cap allows $204,000.",
      vendor: "Sheffield Data",
      actionLabel: "Flag invoice",
      icon: FileText,
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
      category: "price",
    },
    {
      id: "alt-5",
      title: "Possible SLA breach, evidence missing",
      description:
        "On-time delivery was at or below 93%. The vendor report has not arrived.",
      vendor: "Fleafix Freight",
      actionLabel: "Add evidence",
      icon: AlertTriangle,
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      category: "sla",
    },
    {
      id: "alt-6",
      title: "Certificate of insurance is 4 days overdue",
      description: "Due Sep 30. Owner: Celestine Abara, Legal.",
      vendor: "Fleafix Freight",
      actionLabel: "Remind owner",
      icon: ShieldAlert,
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
      category: "insurance",
    },
    {
      id: "alt-7",
      title: "Security review due in 11 days, not started",
      description: "Due Oct 15. Owner: Subash Kallenberg, IT Security.",
      vendor: "Query Cloud",
      actionLabel: "Remind owner",
      icon: Lock,
      iconBg: "bg-slate-100 dark:bg-white/10",
      iconColor: "text-slate-600 dark:text-zinc-300",
      category: "security",
    },
  ]);

  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAction = (alert: AlertItem) => {
    if (alert.actionModule === "obligations") {
      setSelectedVendor(alert.vendor);
      setActiveModule("obligations");
    } else {
      setSelectedVendor(alert.vendor);
      setActiveModule("vetted");
    }
  };

  return (
    <div className="space-y-6">
      <BreadcrumbHeader
        breadcrumbs={[{ label: "Alerts" }, { label: "Open" }]}
        title="Alerts"
        subtitle="7 findings need a decision. Each one says why it matters and what to do next."
        kpi={{
          label: "Money at stake",
          value: "$56.9K",
          sublabel: "across 7 alerts",
        }}
        actions={
          <PillButton
            variant="secondary"
            size="sm"
            icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
          >
            Alert rules
          </PillButton>
        }
      />

      {/* Main Alert List Container Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#16171d] shadow-xs overflow-hidden">
        {/* Table/List Subheader */}
        <div className="px-5 py-3 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <h2 className="text-xs font-semibold text-neutral-900 dark:text-white">
              Open alerts ({alerts.length})
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 hidden sm:inline">
              — Showing {alerts.length} of 7 alerts. Dismiss a finding if it's wrong.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
            Sorted by priority
          </span>
        </div>

        {/* Alert Rows */}
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className="px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-white/2 transition group"
              >
                {/* Left: Icon, Title & Explanation */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${alert.iconBg}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${alert.iconColor}`} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                        {alert.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed truncate md:whitespace-normal">
                      {alert.description}
                    </p>
                  </div>
                </div>

                {/* Right: Vendor Pill, Action Button, and Dismiss Button */}
                <div className="flex items-center gap-3 self-end md:self-auto shrink-0 pl-10 md:pl-0">
                  {/* Vendor Tag */}
                  <div
                    onClick={() => {
                      setSelectedVendor(alert.vendor);
                      setActiveModule("vetted");
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100/90 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-zinc-300 cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500" />
                    <span>{alert.vendor}</span>
                  </div>

                  {/* Contextual Action CTA Button */}
                  <button
                    onClick={() => handleAction(alert)}
                    className="text-xs font-medium px-3 py-1 rounded-full border border-slate-200/90 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-100 shadow-2xs transition cursor-pointer select-none"
                  >
                    {alert.actionLabel}
                  </button>

                  {/* Dismiss Close Icon Button */}
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    title="Dismiss alert"
                    className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {alerts.length === 0 && (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
              All findings resolved or dismissed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

