"use client";

import React from "react";
import clsx from "clsx";
import { Info, Ellipsis } from "lucide-react";

export interface BreakdownSlice {
  name: string;
  /** 0–1 weight; percentages are derived automatically */
  weight: number;
  /** CSS color — use a theme token, e.g. "var(--chart-1)" */
  color: string;
}

export interface BreakdownDonutCardProps {
  title: string;
  subtitle?: string;
  /** e.g. "Total Turns" */
  totalLabel: string;
  /** e.g. "15,612" */
  totalValue: string;
  slices: BreakdownSlice[];
  className?: string;
}

/**
 * Reference: analytics card with a high-contrast SVG donut, center metric
 * label, and a clean legend list with percentage weights.
 */
export function BreakdownDonutCard({
  title,
  subtitle,
  totalLabel,
  totalValue,
  slices,
  className,
}: BreakdownDonutCardProps) {
  const total = slices.reduce((a, s) => a + s.weight, 0) || 1;

  // Donut geometry
  const size = 132;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Precompute sequential dash offsets so slices stack around the ring
  // (functional reduce — no variable reassignment during render).
  const arcs = React.useMemo(() => {
    type Arc = BreakdownSlice & { dash: number; offset: number };
    return slices.reduce<Arc[]>((list, slice) => {
      const prev = list[list.length - 1];
      const prevEnd = prev ? prev.offset + prev.dash : 0;
      const dash = (slice.weight / total) * circumference;
      return [...list, { ...slice, dash, offset: prevEnd }];
    }, []);
  }, [slices, total, circumference]);

  return (
    <div
      className={clsx(
        "rounded-2xl bg-card border border-line p-5 shadow-2xs transition-colors duration-200",
        className
      )}
    >
      {/* Header: title + info dot + options */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <h2 className="font-unbounded font-semibold text-label-sm tracking-[0.06em] text-ink uppercase truncate">
            {title}
          </h2>
          {subtitle && (
            <span
              title={subtitle}
              className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-line text-ink-muted cursor-help"
            >
              <Info className="w-2 h-2" />
            </span>
          )}
        </div>
        <button
          title="Card options"
          className="shrink-0 p-1 rounded-md text-ink-muted hover:text-ink hover:bg-hovered transition cursor-pointer"
        >
          <Ellipsis className="w-4 h-4" />
        </button>
      </div>

      {/* Donut + legend */}
      <div className="mt-4 flex items-center gap-5">
        {/* SVG Donut with center label */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
            role="img"
            aria-label={title}
          >
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--surface-subtle)"
              strokeWidth={stroke}
            />
            {arcs.map((arc) => (
              <circle
                key={arc.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
                strokeDashoffset={-arc.offset}
                strokeLinecap="butt"
                className="transition-all duration-300"
              />
            ))}
          </svg>

          {/* Center metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
            <span className="font-unbounded font-bold text-base text-ink leading-tight whitespace-nowrap">
              {totalValue}
            </span>
            <span className="font-albert text-[10px] text-ink-muted mt-0.5 leading-tight">
              {totalLabel}
            </span>
          </div>
        </div>

        {/* Legend list with percentage weights */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {slices.map((slice) => {
            const pct = ((slice.weight / total) * 100).toFixed(1);
            return (
              <div
                key={slice.name}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: slice.color }}
                  />
                  <span className="font-albert text-xs text-ink-secondary truncate">
                    {slice.name}
                  </span>
                </span>
                <span className="font-mono text-[11px] font-semibold text-ink shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
