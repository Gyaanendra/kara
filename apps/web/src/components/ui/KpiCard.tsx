"use client";

import React from "react";
import clsx from "clsx";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

export interface KpiCardProps {
  /** Uppercase small tracking label, e.g. "MEETINGS INGESTED" */
  label: string;
  /** Large fluid metric numeral, e.g. "15,612" */
  value: string;
  /** e.g. +12.4 or -3.2 */
  changePercent: number;
  /** e.g. "vs last month" */
  changePeriod: string;
  /** 12–14 recent values powering the embedded micro histogram */
  sparklineData: number[];
  /** Optional tooltip text for the (i) icon */
  info?: string;
  className?: string;
}

/**
 * Reference: Shopify-style metric card — small uppercase label, large bold
 * numeral, trend badge, and an embedded micro sparkline histogram on the right.
 */
export function KpiCard({
  label,
  value,
  changePercent,
  changePeriod,
  sparklineData,
  info,
  className,
}: KpiCardProps) {
  const positive = changePercent >= 0;
  const max = Math.max(...sparklineData, 1);
  // Highlight the most recent (last) bar, like the reference histograms
  const activeIdx = sparklineData.length - 1;

  return (
    <div
      className={clsx(
        "rounded-2xl bg-card border border-line shadow-2xs overflow-hidden flex flex-col justify-between hover:border-line-strong transition-all duration-200",
        className
      )}
    >
      <div className="p-4 sm:p-5 space-y-2.5">
        {/* Top row: uppercase label */}
        <div className="flex items-center justify-between">
          <span className="text-label-sm font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase truncate">
            {label}
          </span>
        </div>

        {/* Middle row: large metric + embedded sparkline histogram */}
        <div className="flex items-end justify-between gap-3 pt-0.5">
          <span className="text-metric-lg font-bold font-unbounded tracking-tight text-ink whitespace-nowrap">
            {value}
          </span>

          <div
            className="flex items-end gap-[3px] h-8 shrink-0 pb-0.5"
            aria-hidden
          >
            {sparklineData.map((v, i) => (
              <span
                key={i}
                className={clsx(
                  "w-[3px] rounded-full transition-colors",
                  i === activeIdx ? "bg-accent shadow-xs" : "bg-ink-muted/25"
                )}
                style={{ height: `${Math.max((v / max) * 100, 14)}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom footer strip matching reference design */}
      <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-subtle/60 border-t border-line/60 flex items-center justify-between text-[11px] font-albert">
        {info ? (
          <span
            title={info}
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-ink-muted hover:text-ink cursor-help transition-colors"
          >
            <Info className="w-3 h-3" />
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1.5">
          <span
            className={clsx(
              "inline-flex items-center gap-0.5 font-semibold",
              positive ? "text-success" : "text-error"
            )}
          >
            {positive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {positive ? "+" : ""}
            {changePercent.toFixed(1)}%
          </span>
          <span className="text-ink-muted">{changePeriod}</span>
        </div>
      </div>
    </div>
  );
}
