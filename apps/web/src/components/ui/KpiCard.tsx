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
        "rounded-2xl bg-card border border-line p-5 shadow-2xs space-y-2.5 hover:border-line-strong transition-colors duration-200",
        className
      )}
    >
      {/* Top row: uppercase label + info dot */}
      <div className="flex items-center justify-between">
        <span className="text-label-sm font-albert font-semibold tracking-[0.08em] text-ink-muted uppercase truncate">
          {label}
        </span>
        {info && (
          <span
            title={info}
            className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-line text-ink-muted cursor-help"
          >
            <Info className="w-2 h-2" />
          </span>
        )}
      </div>

      {/* Middle row: large metric + embedded sparkline histogram */}
      <div className="flex items-end justify-between gap-3">
        <span className="text-metric-lg font-bold font-unbounded tracking-tight text-ink whitespace-nowrap">
          {value}
        </span>

        <div
          className="flex items-end gap-[3px] h-8 shrink-0"
          aria-hidden
        >
          {sparklineData.map((v, i) => (
            <span
              key={i}
              className={clsx(
                "w-[3px] rounded-full transition-colors",
                i === activeIdx ? "bg-accent" : "bg-ink-muted/30"
              )}
              style={{ height: `${Math.max((v / max) * 100, 12)}%` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom row: trend badge */}
      <div className="flex items-center gap-1.5 text-[11px] font-albert">
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
  );
}
