"use client";

import React from "react";
import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight, Ellipsis } from "lucide-react";

export interface TopMeetingRow {
  name: string;
  /** e.g. "$125,000" or "48 turns" */
  value: string;
  /** e.g. +12.5 or -3.2 */
  changePercent: number;
}

export interface TopMeetingsCardProps {
  title: string;
  subtitle?: string;
  rows: TopMeetingRow[];
  className?: string;
}

/**
 * Reference: secondary analytics list — meeting/page names with view counts
 * and positive/negative trend indicators.
 */
export function TopMeetingsCard({
  title,
  subtitle,
  rows,
  className,
}: TopMeetingsCardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-card border border-line p-5 shadow-2xs transition-colors duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-unbounded font-semibold text-label-sm tracking-[0.06em] text-ink uppercase truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="font-albert text-[10px] text-ink-muted mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <button
          title="Card options"
          className="shrink-0 p-1 rounded-md text-ink-muted hover:text-ink hover:bg-hovered transition cursor-pointer"
        >
          <Ellipsis className="w-4 h-4" />
        </button>
      </div>

      {/* Rows */}
      <div className="mt-3 divide-y divide-line">
        {rows.map((row, i) => {
          const positive = row.changePercent >= 0;
          return (
            <div
              key={`${row.name}-${i}`}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[10px] text-ink-muted w-4 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-albert text-xs text-ink truncate">
                  {row.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[11px] font-semibold text-ink-secondary">
                  {row.value}
                </span>
                <span
                  className={clsx(
                    "inline-flex items-center gap-0.5 font-albert text-[10px] font-semibold",
                    positive ? "text-success" : "text-error"
                  )}
                >
                  {positive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {positive ? "+" : ""}
                  {row.changePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
