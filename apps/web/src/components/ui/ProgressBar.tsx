import React from "react";
import clsx from "clsx";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
  status?: "good" | "warning" | "danger";
}

export function ProgressBar({
  current,
  total,
  label,
  className,
  status = "good",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / (total || 1)) * 100));

  const statusColors = {
    good: "bg-emerald-500 dark:bg-emerald-400",
    warning: "bg-amber-500 dark:bg-amber-400",
    danger: "bg-rose-500 dark:bg-rose-400",
  };

  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      <div className="w-16 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden shrink-0">
        <div
          className={clsx("h-full rounded-full transition-all duration-300", statusColors[status])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 shrink-0">
        {label || `${current} of ${total}`}
      </span>
    </div>
  );
}

