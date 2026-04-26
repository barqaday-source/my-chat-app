// ====================================================================
// useTheme - النسخة المطورة: وضع ليلي + ألوان لوحة التحكم (Realtime)
// ====================================================================

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
// بدلاً من السطر القديم الذي يحتوي على @/server/supabase
import { supabase } from "../server/supabase"; 


type Theme = "light" | "dark";

interface AppSettings {
  app_bg_color: string;
  app_icon_color: string;
  app_button_color: string;
}

interface Ctx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  settings: AppSettings; // الألوان القادمة من سوبابيس
}

const ThemeContext = createContext<Ctx | undefined>(undefined);
const STORAGE_KEY = "dardashati-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 1. إدارة الوضع الليلي/النهاري (المحلي)
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  // 2. حالة ألوان "الوحش" القادمة من قاعدة البيانات
  const [settings, setSettings] = useState<AppSettings>({
    app_bg_color: "#F46397", // قيم افتراضية
    app_icon_color: "#2C3C05",
    app_button_color: "#585752"
  });

  // 3. جلب الألوان من سوبابيس وتفعيل التحديث اللحظي (Realtime)
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("app_settings").select("key, value");
      if (data) {
        const newSettings: any = {};
        data.forEach(item => { newSettings[item.key] = item.value; });
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
    };

    fetchSettings();

    // الاشتراك في التغييرات اللحظية: بمجرد تغيير اللون في اللوحة، يتغير هنا فوراً!
    const channel = supabase
      .channel("app_settings_changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "app_settings" }, 
      (payload) => {
        setSettings(prev => ({ ...prev, [payload.new.key]: payload.new.value }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 4. تطبيق الـ Dark Mode على الـ HTML
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(STORAGE_KEY, theme);
    
    // حقن ألوان سوبابيس في متغيرات CSS لكي تستخدمها في كل مكان
    root.style.setProperty("--app-bg", settings.app_bg_color);
    root.style.setProperty("--app-icon", settings.app_icon_color);
    root.style.setProperty("--app-btn", settings.app_button_color);
  }, [theme, settings]);

  const toggle = () => setThemeState((p) => (p === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme: setThemeState, settings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
          }
