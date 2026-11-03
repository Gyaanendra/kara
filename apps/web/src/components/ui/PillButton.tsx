import React from "react";
import clsx from "clsx";

export type PillVariant =
  | "primary"
  | "secondary"
  | "emerald"
  | "outline"
  | "ghost"
  | "danger-ghost";

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PillVariant;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function PillButton({
  variant = "secondary",
  size = "md",
  icon,
  children,
  className,
  ...props
}: PillButtonProps) {
  const sizeStyles = {
    sm: "px-2.5 py-1 text-[11px] gap-1.5",
    md: "px-3.5 py-1.5 text-xs gap-2",
    lg: "px-4 py-2 text-sm gap-2.5",
  };

  const variantStyles: Record<PillVariant, string> = {
    primary:
      "bg-neutral-900 text-white hover:bg-black shadow-xs dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 font-medium",
    secondary:
      "bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50/80 shadow-xs dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10 font-medium",
    emerald:
      "bg-emerald-500 text-neutral-950 hover:bg-emerald-400 font-semibold shadow-xs dark:bg-emerald-500 dark:hover:bg-emerald-400",
    outline:
      "border border-slate-200/80 text-slate-700 hover:bg-slate-100/60 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/5 font-medium",
    ghost:
      "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100",
    "danger-ghost":
      "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10",
  };

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

