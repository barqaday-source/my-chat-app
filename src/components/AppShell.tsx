// ====================================================================
// AppShell - النسخة المصححة والمدمجة بالعداد
// ====================================================================

import { ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  MessageSquare, User, Bell, Menu, X, LogOut, 
  Shield, Globe, Settings as SettingsIcon, Search, Sparkles 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import UserAvatar from "@/components/UserAvatar";
import NotificationBadge from "@/components/NotificationBadge"; // استيراد العداد

interface Props {
  children: ReactNode;
  bare?: boolean;
}

export default function AppShell({ children, bare = false }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { settings } = useAppSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV = [
    { to: "/profile",       icon: User,          label: "حسابي" },
    { to: "/chat",          icon: MessageSquare, label: "الدردشة" },
    { to: "/notifications", icon: Bell,          label: "إشعارات" },
  ];

  if (bare) return <>{children}</>;

  return (
    <div className="min-h-screen bg-transparent pb-24">
      
      {/* الشريط العلوي */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 glass-nav border-b border-white/20 px-5 flex items-center justify-between">
        <button onClick={() => setMenuOpen(true)} className="p-2.5 rounded-xl hover:bg-white/30 transition-all active:scale-90">
          <Menu className="w-6 h-6 text-[#007AFF]" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black bg-gradient-to-r from-[#007AFF] to-[#4facfe] bg-clip-text text-transparent italic uppercase tracking-tighter">
            {settings.app_name || "دردشاتي"}
          </h1>
          <Sparkles className="w-4 h-4 text-[#007AFF] opacity-50" />
        </div>

        <button className="p-2.5 rounded-xl hover:bg-white/30 transition-all active:scale-90">
          <Search className="w-5 h-5 text-[#007AFF]/60" />
        </button>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="pt-20 px-4 anim-fade-in">
        {children}
      </main>

      {/* الشريط السفلي العائم - تم تصحيح الدمج هنا */}
      <nav className="fixed bottom-6 inset-x-6 z-50 h-18 rounded-[2.5rem] glass-thick border border-white/40 shadow-2xl flex items-center justify-around px-4">
        {NAV.map((item) => {
          const isActive = location.pathname === item.to;
          const isNotifications = item.to === "/notifications";

          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
                isActive ? "scale-110 -translate-y-1" : "opacity-40 hover:opacity-100"
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all ${isActive ? "bg-[#007AFF] shadow-lg shadow-[#007AFF]/40" : ""}`}>
                <item.icon className={`w-6 h-6 ${isActive ? "text-white" : "text-[#007AFF]"}`} />
                
                {/* حقن العداد حصراً فوق أيقونة الإشعارات */}
                {isNotifications && <NotificationBadge />}
              </div>
              
              {isActive && (
                <span className="absolute -bottom-5 text-[9px] font-black text-[#007AFF] uppercase tracking-widest animate-pulse">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* القائمة الجانبية (بقيت كما هي بدون تغيير) */}
      {/* ... باقي الكود الخاص بالـ Aside والاستايل ... */}
      {menuOpen && (
         <>
          <div className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-sm anim-fade-in" onClick={() => setMenuOpen(false)} />
          <aside className="fixed top-4 right-4 bottom-4 w-[280px] z-[70] rounded-[2.5rem] glass-thick border border-white/50 shadow-2xl p-6 flex flex-col anim-slide-right">
             {/* محتوى المنيو الذي تملكه */}
             <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <UserAvatar profile={profile} className="w-12 h-12 border-2 border-[#007AFF]/20 shadow-sm" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#007AFF]/40 uppercase tracking-tighter italic">مرحباً بك</span>
                  <span className="text-sm font-black text-[#007AFF] truncate w-32">{profile?.display_name || "المستخدم"}</span>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2.5 rounded-full bg-[#007AFF]/5 text-[#007AFF] hover:rotate-90 transition-transform">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
              <MenuLink icon={Globe} label="الصفحة الرئيسية" onClick={() => { navigate("/chat"); setMenuOpen(false); }} />
              <div className="h-[1px] bg-gradient-to-r from-transparent via-[#007AFF]/10 to-transparent my-4 mx-4" />
              <MenuLink icon={Shield} label="سياسة الخصوصية" onClick={() => {}} />
              <div className="p-4 rounded-2xl bg-[#007AFF]/5 border border-[#007AFF]/10 my-2">
                 <div className="flex items-center gap-3 text-[#007AFF]">
                    <User className="w-4 h-4 opacity-70" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">المطور</span>
                 </div>
                 <p className="text-xs font-black text-[#007AFF] mt-1 mr-7">{settings.dev_name || "بارق عداي"}</p>
              </div>
              <MenuLink icon={MessageSquare} label="تواصل معنا" onClick={() => {
                 const wa = settings.support_whatsapp?.replace(/\D/g, "");
                 if(wa) window.open(`https://wa.me/${wa}`, '_blank');
              }} />
            </div>

            <div className="mt-auto pt-6 border-t border-[#007AFF]/5">
              <button onClick={async () => { await signOut(); navigate("/auth"); }} className="w-full h-14 rounded-2xl bg-red-500/5 text-red-400 flex items-center justify-center gap-3 font-black text-xs border border-red-500/10 mb-6">
                <LogOut className="w-4 h-4" /> تسجيل الخروج
              </button>
              <div className="text-center">
                <h2 className="text-sm font-black bg-gradient-to-r from-[#007AFF] to-[#4facfe] bg-clip-text text-transparent italic uppercase">{settings.app_name}</h2>
                <p className="text-[9px] font-bold text-[#007AFF]/30 tracking-[0.2em] uppercase">جميع الحقوق محفوظة © {settings.copyright_year || "2026"}</p>
              </div>
            </div>
          </aside>
         </>
      )}

      <style>{`
        .glass-nav { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(15px); }
        .glass-thick { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(25px); }
        .anim-slide-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideRight { from { transform: translateX(110%); } to { transform: translateX(0); } }
        .h-18 { height: 4.5rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 122, 255, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}

function MenuLink({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[#007AFF]/5 transition text-[#007AFF] group">
      <Icon className="w-5 h-5 opacity-60 group-hover:opacity-100" />
      <span className="font-black text-xs uppercase tracking-wider">{label}</span>
    </button>
  );
}
