"use client";

import React from "react";
import clsx from "clsx";
import { ChevronRight, PanelLeftOpen } from "lucide-react";
import { useWorkspaceStore } from "../../lib/store";

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  kpi?: {
    label: string;
    value: string;
    sublabel?: string;
  };
  actions?: React.ReactNode;
  className?: string;
}

export function BreadcrumbHeader({
  breadcrumbs,
  title,
  subtitle,
  kpi,
  actions,
  className,
}: BreadcrumbHeaderProps) {
  const { isSidebarOpen, toggleSidebar } = useWorkspaceStore();

  return (
    <div
      className={clsx(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/70 dark:border-white/10 select-none",
        className
      )}
    >
      <div className="space-y-1">
        {/* Breadcrumb Path & Expand Trigger if Sidebar Collapsed */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 font-medium">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              title="Expand Filter Panel"
              className="p-1 rounded-md border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-zinc-300 transition cursor-pointer mr-1"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-zinc-600" />}
              <span
                onClick={crumb.onClick}
                className={clsx(
                  crumb.onClick
                    ? "hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                    : "",
                  idx === breadcrumbs.length - 1
                    ? "text-slate-600 dark:text-zinc-400"
                    : ""
                )}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Title and Subtitle */}
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h1>
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right KPIs & Primary Action Buttons */}
      <div className="flex items-center gap-4 self-start md:self-auto shrink-0">
        {kpi && (
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-semibold">
              {kpi.label}
            </span>
            <span className="text-lg font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
              {kpi.value}
            </span>
            {kpi.sublabel && (
              <span className="block text-[10px] text-slate-400 dark:text-zinc-500">
                {kpi.sublabel}
              </span>
            )}
          </div>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
