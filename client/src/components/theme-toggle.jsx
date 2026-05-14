import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "../context/theme-context.jsx";
import { Button } from "./ui/button.jsx";

export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={className}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunMedium className="size-4" />
      ) : (
        <MoonStar className="size-4" />
      )}
    </Button>
  );
}
