import { cn } from "../../lib/utils.js";

export function Card({ className, ...props }) {
  return (
    <div className={cn("glass-panel rounded-[28px] p-6", className)} {...props} />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("mb-5 space-y-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h2 className={cn("text-xl font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("space-y-4", className)} {...props} />;
}
