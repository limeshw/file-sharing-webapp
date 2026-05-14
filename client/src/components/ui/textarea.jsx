import { cn } from "../../lib/utils.js";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-3xl border border-border bg-white/70 px-4 py-3 text-sm text-foreground placeholder:text-muted/80 focus-visible:ring-4 focus-visible:ring-ring dark:bg-slate-950/30",
        className,
      )}
      {...props}
    />
  );
}
