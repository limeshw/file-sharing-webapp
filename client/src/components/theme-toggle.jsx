import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "../context/theme-context.jsx";
import { Button } from "./ui/button.jsx";
import { cn } from "../lib/utils.js";

export function ThemeToggle({ className, showLabel = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="secondary"
      size={showLabel ? "default" : "icon"}
      className={cn("min-w-10", className)}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunMedium className="size-4" />
      ) : (
        <MoonStar className="size-4" />
      )}
    </Button>
  );
}
