import { cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-foreground shadow-sm shadow-indigo-500/10 hover:brightness-105 hover:shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5",
        secondary:
          "border border-border bg-card/85 text-foreground shadow-sm backdrop-blur-md hover:bg-slate-100 hover:shadow-md dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10 dark:hover:border-white/10 hover:-translate-y-0.5",
        ghost: "text-muted hover:bg-slate-100 dark:hover:bg-white/5 hover:text-foreground",
        danger:
          "bg-danger text-white shadow-sm hover:brightness-110 hover:-translate-y-0.5",
      },
      size: {
        default: "px-5 py-3",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-3.5 text-base",
        icon: "size-10 rounded-full shrink-0 flex items-center justify-center p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
