import { cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default:
          "bg-accent px-5 py-3 text-accent-foreground shadow-lg shadow-blue-500/20 hover:translate-y-[-1px] hover:shadow-xl",
        secondary:
          "glass-panel px-5 py-3 text-foreground hover:bg-white/70 dark:hover:bg-white/8",
        ghost: "px-4 py-2 text-muted hover:bg-white/50 dark:hover:bg-white/6",
        danger:
          "bg-danger px-5 py-3 text-white shadow-lg shadow-rose-500/20 hover:brightness-110",
      },
      size: {
        default: "",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-3.5 text-base",
        icon: "size-10 rounded-full",
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
