import { cn } from "../../lib/utils.js";

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/20 bg-white/70 px-3 py-1 text-xs font-medium text-muted dark:bg-white/6",
        className,
      )}
      {...props}
    />
  );
}
