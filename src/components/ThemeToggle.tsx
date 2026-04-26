// ====================================================================
// ThemeToggle - زر التبديل بين الوضع الليلي والنهاري
// ====================================================================

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        onClick={toggle}
        className="p-2 rounded-xl hover:bg-muted/50 transition"
        aria-label={isDark ? "وضع نهاري" : "وضع ليلي"}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-background/50 transition text-right"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      <span className="font-medium">{isDark ? "الوضع النهاري" : "الوضع الليلي"}</span>
    </button>
  );
}
