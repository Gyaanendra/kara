import React from "react";
import clsx from "clsx";

export type BadgeVariant =
  | "good"
  | "at-risk"
  | "attention"
  | "under-review"
  | "summary"
  | "neutral";

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({
  variant = "neutral",
  children,
  className,
  dot = false,
}: StatusBadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    good: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    "at-risk": "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    attention: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    "under-review": "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    summary: "bg-slate-100 text-slate-700 border-slate-200/90 dark:bg-white/10 dark:text-zinc-300 dark:border-white/15",
    neutral: "bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10",
  };

  const dotColors: Record<BadgeVariant, string> = {
    good: "bg-emerald-500",
    "at-risk": "bg-rose-500",
    attention: "bg-amber-500",
    "under-review": "bg-indigo-500",
    summary: "bg-slate-500",
    neutral: "bg-slate-400",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border leading-tight transition-colors select-none",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

