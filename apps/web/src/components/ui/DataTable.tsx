"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { Search, Plus, Ellipsis, FileText, CheckSquare, Square } from "lucide-react";

export type TableStatus = "synthesized" | "processing" | "synced" | "assigned";

export interface TableRowData {
  id: string;
  name: string;
  platform: string;
  status: TableStatus;
  statusLabel: string;
  tasks: string;
  owner: string;
  impact: string;
}

const STATUS_STYLES: Record<TableStatus, { dot: string; pill: string }> = {
  synthesized: {
    dot: "bg-success",
    pill: "bg-success/10 text-success border-success/25",
  },
  processing: {
    dot: "bg-warning",
    pill: "bg-warning/10 text-warning border-warning/25",
  },
  synced: {
    dot: "bg-accent",
    pill: "bg-accent-soft text-accent border-accent/25",
  },
  assigned: {
    dot: "bg-chart-2",
    pill: "bg-chart-2/10 text-chart-2 border-chart-2/25",
  },
};

/** Initials avatar color cycling via theme chart tokens */
const AVATAR_TOKENS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4"];

function initials(name: string): string {
  const words = name.replace(/\(.*\)/, "").trim().split(/\s+/);
  const first = words[0]?.[0] ?? "?";
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

export interface DataTableProps {
  title: string;
  subtitle?: string;
  rows: TableRowData[];
  /** Primary action label, e.g. "Dispatch Bot" */
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  className?: string;
}

/**
 * Reference: dense data table — top bar with search (⌘K) + primary button,
 * select-all/row checkboxes, soft status pill badges, and clean 48px rows.
 */
export function DataTable({
  title,
  subtitle,
  rows,
  primaryActionLabel = "Dispatch Bot",
  onPrimaryAction,
  className,
}: DataTableProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.platform, r.statusLabel, r.owner, r.tasks].some((f) =>
        f.toLowerCase().includes(q)
      )
    );
  }, [query, rows]);

  const allChecked =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const someChecked = filtered.some((r) => selected.has(r.id));

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      if (allChecked) {
        const next = new Set(prev);
        filtered.forEach((r) => next.delete(r.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((r) => next.add(r.id));
      return next;
    });
  };

  return (
    <div
      className={clsx(
        "rounded-2xl bg-card border border-line shadow-2xs overflow-hidden transition-colors duration-200",
        className
      )}
    >
      {/* Header bar: title, search ⌘K, primary action, options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-line">
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

        <div className="flex items-center gap-2.5">
          {/* Search with ⌘K hint */}
          <div className="relative flex items-center rounded-lg bg-subtle border border-line px-2.5 py-1.5 text-xs shadow-2xs focus-within:border-line-strong transition">
            <Search className="w-3.5 h-3.5 text-ink-muted mr-1.5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rows..."
              className="bg-transparent text-xs font-albert text-ink placeholder-ink-muted focus:outline-hidden w-32 lg:w-44"
            />
            <kbd className="text-[10px] font-mono text-ink-muted ml-2 border border-line rounded px-1 shrink-0">
              ⌘K
            </kbd>
          </div>

          {/* Primary action */}
          <button
            onClick={onPrimaryAction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-on-accent text-xs font-albert font-semibold shadow-2xs hover:opacity-90 active:opacity-80 transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {primaryActionLabel}
          </button>

          <button
            title="Table options"
            className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-hovered transition cursor-pointer shrink-0"
          >
            <Ellipsis className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-subtle/50">
              <th className="w-10 px-4 py-2.5">
                <button
                  onClick={toggleAll}
                  title={allChecked ? "Deselect all" : "Select all"}
                  className="text-ink-muted hover:text-ink transition cursor-pointer"
                  aria-label="Select all rows"
                >
                  {allChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-accent" />
                  ) : someChecked ? (
                    <span className="block w-3 h-3 rounded-[3px] bg-accent/40 border border-accent" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
              </th>
              <th className="px-3 py-2.5 text-label-sm font-albert font-semibold tracking-[0.06em] text-ink-muted uppercase">
                Meeting / Task
              </th>
              <th className="px-3 py-2.5 text-label-sm font-albert font-semibold tracking-[0.06em] text-ink-muted uppercase">
                Pipeline Stage
              </th>
              <th className="px-3 py-2.5 text-label-sm font-albert font-semibold tracking-[0.06em] text-ink-muted uppercase hidden lg:table-cell">
                Outcome
              </th>
              <th className="px-3 py-2.5 text-label-sm font-albert font-semibold tracking-[0.06em] text-ink-muted uppercase hidden md:table-cell">
                Owner
              </th>
              <th className="px-3 py-2.5 text-label-sm font-albert font-semibold tracking-[0.06em] text-ink-muted uppercase text-right">
                Deal Value
              </th>
              <th className="w-10 px-3 py-2.5" aria-label="Row actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center font-albert text-xs text-ink-muted"
                >
                  No rows match “{query}”.
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => {
                const isSelected = selected.has(row.id);
                const status = STATUS_STYLES[row.status];
                return (
                  <tr
                    key={row.id}
                    className={clsx(
                      "border-b border-line last:border-b-0 transition-colors h-12",
                      isSelected ? "bg-accent-soft/40" : "hover:bg-hovered/40"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4">
                      <button
                        onClick={() => toggleRow(row.id)}
                        aria-label={`Select ${row.name}`}
                        className="text-ink-muted hover:text-ink transition cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-accent" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                    {/* Title + platform */}
                    <td className="px-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={clsx(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                            AVATAR_TOKENS[i % AVATAR_TOKENS.length],
                            "text-on-accent/90"
                          )}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <span className="block font-albert text-xs font-medium text-ink truncate max-w-[220px]">
                            {row.name}
                          </span>
                          <span className="block font-albert text-[10px] text-ink-muted truncate">
                            {row.platform}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status pill */}
                    <td className="px-3">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-albert font-semibold whitespace-nowrap",
                          status.pill
                        )}
                      >
                        <span
                          className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            status.dot
                          )}
                        />
                        {row.statusLabel}
                      </span>
                    </td>

                    {/* Outcome */}
                    <td className="px-3 font-albert text-[11px] text-ink-secondary hidden lg:table-cell">
                      {row.tasks}
                    </td>

                    {/* Owner */}
                    <td className="px-3 hidden md:table-cell">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={clsx(
                            "w-6 h-6 rounded-full flex items-center justify-center font-unbounded text-[9px] font-bold shrink-0",
                            AVATAR_TOKENS[(i + 1) % AVATAR_TOKENS.length],
                            "text-on-accent/90"
                          )}
                        >
                          {initials(row.owner)}
                        </span>
                        <span className="font-albert text-[11px] text-ink-secondary truncate max-w-[140px]">
                          {row.owner}
                        </span>
                      </div>
                    </td>

                    {/* Deal value */}
                    <td className="px-3 text-right font-mono text-xs font-semibold text-ink whitespace-nowrap">
                      {row.impact}
                    </td>

                    {/* Row actions */}
                    <td className="px-3">
                      <button
                        title="Row actions"
                        className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-hovered transition cursor-pointer"
                      >
                        <Ellipsis className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
