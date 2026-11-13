"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { Info, Ellipsis } from "lucide-react";
import { useWorkspaceStore } from "../../lib/store";

export interface TelemetrySeries {
  name: string;
  /** CSS color (use a theme chart token, e.g. "var(--chart-1)") */
  color: string;
  /** values aligned 1:1 with `periods` */
  values: number[];
}

export interface TelemetryChartCardProps {
  title: string;
  subtitle?: string;
  /** e.g. "Total Minutes" */
  primaryLabel: string;
  /** Fixed override for the headline number; otherwise the series sum is used */
  primaryValue?: string;
  /** Formatter for values inside the tooltip, defaults to k-formatting */
  formatValue?: (v: number) => string;
  /** Axis + tooltip value unit suffix, e.g. "min" */
  unit?: string;
  /** Labels under each bar (Jan, Feb, ... / W1.. / D1..) */
  periods?: string[];
  series: TelemetrySeries[];
  className?: string;
}

const AXIS_STEPS = [0, 0.25, 0.5, 0.75, 1];

function formatK(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return `${Math.round(v)}`;
}

function niceMax(v: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (m * pow >= v) return m * pow;
  }
  return v;
}

/**
 * Reference: analytics card with a large total, legend dots, segmented
 * time pills, stacked vertical bars, and a floating hover tooltip.
 */
export function TelemetryChartCard({
  title,
  subtitle,
  primaryLabel,
  primaryValue,
  formatValue = formatK,
  unit,
  periods,
  series,
  className,
}: TelemetryChartCardProps) {
  const { timeView, setTimeView, chartMetric, setChartMetric } = useWorkspaceStore();
  const [hovered, setHovered] = useState<number | null>(null);

  const labels = useMemo(
    () => periods ?? (timeView === "daily"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : timeView === "weekly"
      ? Array.from({ length: 12 }, (_, i) => `W${i + 1}`)
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]),
    [periods, timeView]
  );

  const total = useMemo(
    () => series.reduce((acc, s) => acc + s.values.reduce((a, b) => a + b, 0), 0),
    [series]
  );

  // Bars are indexed against the active period length; series values cycle to fit.
  const stacked = useMemo(() => {
    const n = labels.length;
    return labels.map((label, i) => ({
      label,
      segments: series.map((s) => {
        const arr = s.values;
        const scaled = arr.length === n ? arr[i] : arr[i % arr.length] * (n / Math.max(arr.length, 1)) || 0;
        return { name: s.name, color: s.color, value: scaled };
      }),
    }));
  }, [labels, series]);

  const maxStack = useMemo(
    () => niceMax(Math.max(...stacked.map((d) => d.segments.reduce((a, b) => a + b.value, 0)), 1)),
    [stacked]
  );

  const axisLabels = useMemo(
    () =>
      AXIS_STEPS.slice()
        .reverse()
        .map((step) => formatValue(maxStack * step)),
    [maxStack, formatValue]
  );

  const hoveredData = hovered !== null ? stacked[hovered] : null;
  const hoveredTotal = hoveredData?.segments.reduce((a, b) => a + b.value, 0) ?? 0;

  return (
    <div
      className={clsx(
        "rounded-2xl bg-card border border-line p-5 md:p-6 shadow-2xs transition-colors duration-200",
        className
      )}
    >
      {/* Header: title + info dot + options */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <h2 className="font-unbounded font-semibold text-label-sm md:text-xs tracking-[0.06em] text-ink uppercase truncate">
            {title}
          </h2>
          {subtitle && (
            <span title={subtitle} className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-line text-ink-muted cursor-help">
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

      {/* Subheader: total + legend | segmented pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <span className="block font-albert text-[11px] text-ink-muted">
              {primaryLabel}
            </span>
            <span className="text-header-md font-bold font-unbounded tracking-tight text-ink leading-tight">
              {primaryValue ?? formatValue(total)}
              {unit && (
                <span className="font-albert font-medium text-[11px] text-ink-muted ml-1">
                  {unit}
                </span>
              )}
            </span>
          </div>

          {/* Legend dots */}
          <div className="flex items-center gap-3 pb-0.5">
            {series.map((s) => (
              <span
                key={s.name}
                className="flex items-center gap-1.5 font-albert text-[11px] text-ink-secondary"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: s.color }}
                />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric toggle (series data source) */}
          <div className="flex p-0.5 rounded-lg bg-subtle border border-line text-[11px] font-albert">
            <button
              onClick={() => setChartMetric("total")}
              className={clsx(
                "px-2.5 py-1 rounded-md transition cursor-pointer",
                chartMetric === "total"
                  ? "bg-card text-ink font-medium shadow-2xs"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              Speech Min
            </button>
            <button
              onClick={() => setChartMetric("impact")}
              className={clsx(
                "px-2.5 py-1 rounded-md transition cursor-pointer",
                chartMetric === "impact"
                  ? "bg-card text-ink font-medium shadow-2xs"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              pgvector Chunks
            </button>
          </div>

          {/* Segmented time pills */}
          <div className="flex p-0.5 rounded-lg bg-subtle border border-line text-[11px] font-albert">
            {(["daily", "weekly", "monthly"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setTimeView(view)}
                className={clsx(
                  "px-2.5 py-1 rounded-md transition cursor-pointer capitalize",
                  timeView === view
                    ? "bg-card text-ink font-medium shadow-2xs"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="mt-5 flex items-stretch gap-3">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between h-52 text-[10px] font-mono text-ink-muted text-right shrink-0 select-none py-px">
          {axisLabels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>

        {/* Bars with grid lines */}
        <div className="relative flex-1 h-52">
          {/* Horizontal grid */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" aria-hidden>
            {AXIS_STEPS.map((_, i) => (
              <span key={i} className="border-t border-line/70 w-full" />
            ))}
          </div>

          {/* Stacked bars */}
          <div
            className="relative h-full flex items-end justify-between gap-1 md:gap-1.5"
            onMouseLeave={() => setHovered(null)}
          >
            {stacked.map((d, i) => {
              const stackValue = d.segments.reduce((a, b) => a + b.value, 0);
              const stackPct = Math.max((stackValue / maxStack) * 100, 1.5);
              return (
                <div
                  key={d.label}
                  className="group relative flex-1 h-full flex items-end justify-center cursor-default"
                  onMouseEnter={() => setHovered(i)}
                >
                  <div
                    className="w-full max-w-[18px] flex flex-col rounded-[3px] overflow-hidden transition-opacity"
                    style={{ height: `${stackPct}%` }}
                  >
                    {d.segments.map((seg, si) => {
                      const segPct = stackValue > 0 ? (seg.value / stackValue) * 100 : 0;
                      return (
                        <span
                          key={si}
                          className="w-full transition-opacity"
                          style={{
                            height: `${segPct}%`,
                            background: seg.color,
                            opacity: hovered === null || hovered === i ? 1 : 0.45,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Floating tooltip */}
                  {hovered === i && (
                    <div
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 w-max max-w-[220px] rounded-lg bg-card border border-line-strong shadow-lg px-3 py-2 pointer-events-none"
                      role="tooltip"
                    >
                      <div className="flex items-center gap-1.5 font-albert text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                        {d.label}
                      </div>
                      {d.segments.map((seg) => (
                        <div
                          key={seg.name}
                          className="flex items-center justify-between gap-3 font-albert text-[11px] mt-1"
                        >
                          <span className="flex items-center gap-1.5 text-ink-secondary">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: seg.color }}
                            />
                            {seg.name}
                          </span>
                          <span className="font-mono font-semibold text-ink">
                            {formatValue(seg.value)}
                            {unit ? ` ${unit}` : ""}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between gap-3 font-albert text-[11px] mt-1.5 pt-1.5 border-t border-line">
                        <span className="text-ink-muted">Total</span>
                        <span className="font-mono font-bold text-ink">
                          {formatValue(hoveredTotal)}
                          {unit ? ` ${unit}` : ""}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="mt-2 pl-0 flex justify-between text-[10px] font-mono text-ink-muted select-none">
        {stacked.map((d) => (
          <span key={d.label} className="flex-1 text-center truncate">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
