import React from "react";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";

interface UserAvatar {
  name: string;
  initials: string;
  color?: string;
  image?: string;
}

interface AvatarStackProps {
  users?: UserAvatar[];
  count?: number;
  className?: string;
  showChevron?: boolean;
}

export function AvatarStack({
  users = [
    { name: "Alex Chen", initials: "AC", color: "bg-indigo-500" },
    { name: "Sara V.", initials: "SV", color: "bg-emerald-500" },
  ],
  count,
  className,
  showChevron = true,
}: AvatarStackProps) {
  return (
    <div className={clsx("flex items-center gap-1.5 cursor-pointer group", className)}>
      <div className="flex -space-x-1.5 overflow-hidden p-0.5">
        {users.slice(0, 2).map((user, idx) => (
          <div
            key={idx}
            title={user.name}
            className={clsx(
              "inline-flex items-center justify-center w-5 h-5 rounded-full ring-2 ring-white dark:ring-neutral-900 text-[9px] font-semibold text-white",
              user.color || "bg-slate-600"
            )}
          >
            {user.initials}
          </div>
        ))}
      </div>
      {count && count > users.length && (
        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
          +{count - users.length}
        </span>
      )}
      {showChevron && (
        <ChevronRight className="w-3 h-3 text-slate-300 dark:text-zinc-600 group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition" />
      )}
    </div>
  );
}

