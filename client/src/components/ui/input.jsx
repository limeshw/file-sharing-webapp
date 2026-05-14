import { cn } from "../../lib/utils.js";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-foreground placeholder:text-muted/80 focus-visible:ring-4 focus-visible:ring-ring dark:bg-slate-950/30",
        className,
      )}
      {...props}
    />
  );
}
