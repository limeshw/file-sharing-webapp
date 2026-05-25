import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/utils.js";

export function Progress({ className, value, ...props }) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-3.5 w-full overflow-hidden rounded-full bg-slate-200/50 border border-slate-200/10 dark:bg-white/5 dark:border-white/5",
        className,
      )}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
