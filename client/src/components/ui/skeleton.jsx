import { cn } from "../../lib/utils.js";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/80",
        className,
      )}
      {...props}
    />
  );
}
