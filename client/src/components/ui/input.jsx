import { cn } from "../../lib/utils.js";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus-visible:border-accent/30 focus-visible:ring-4 focus-visible:ring-accent/10 dark:bg-white/5 dark:border-white/5 dark:hover:border-white/10 dark:focus-visible:border-accent/50 dark:focus-visible:ring-accent/10",
        className,
      )}
      {...props}
    />
  );
}
