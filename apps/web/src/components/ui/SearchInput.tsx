import React from "react";
import { Search } from "lucide-react";
import clsx from "clsx";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  shortcut?: string;
}

export function SearchInput({
  containerClassName,
  shortcut = "⌘K",
  className,
  placeholder = "Search...",
  ...props
}: SearchInputProps) {
  return (
    <div
      className={clsx(
        "relative flex items-center rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-2.5 py-1.5 transition-colors focus-within:border-slate-400 dark:focus-within:border-white/20",
        containerClassName
      )}
    >
      <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        className={clsx(
          "w-full bg-transparent px-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-hidden",
          className
        )}
        {...props}
      />
      {shortcut && (
        <kbd className="ml-auto pointer-events-none inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500 border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5">
          {shortcut}
        </kbd>
      )}
    </div>
  );
}

