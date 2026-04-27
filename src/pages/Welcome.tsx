// ====================================================================
// Welcome - بوابة الدخول الذكية (المربوطة بقاعدة البيانات)
// ====================================================================

import { useNavigate } from "react-router-dom";
// بدلاً من السطر الذي يحتوي على @/hooks/useTheme
import { useTheme } from "@/hooks/useTheme";


import { ChevronLeft, MessageCircle, Users, Sparkles, LogIn } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  // جلب الألوان والنصوص (مثل اسم التطبيق) من الهوك المربوط بـ Supabase
  const { settings } = useTheme(); 

  // استخراج القيم من الإعدادات مع وضع قيم افتراضية للحماية
  const appName = settings.app_name || "دردشاتي";
  const appTagline = settings.app_tagline || "بوابتك لعالم من التواصل الحر والآمن";

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-between px-6 py-12"
         style={{ backgroundColor: settings.app_bg_color }}> {/* تطبيق لون الخلفية المختار من اللوحة */}
      
      {/* خلفية انسيابية - تعتمد ألوانها الآن على "لون الأيقونات" لضمان التناسق */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="blob blob-1" style={{ background: settings.app_icon_color }} />
        <div className="blob blob-2" style={{ background: settings.app_button_color }} />
        <div className="blob blob-3" style={{ background: '#FFFFFF' }} />
        <div className="liquid-overlay" />
      </div>

      {/* الهيدر العلوي */}
      <header className="relative z-10 w-full flex items-center justify-end anim-fade-in">
        <button 
          onClick={() => navigate("/auth?mode=login")} 
          className="flex items-center gap-2 h-11 px-6 rounded-2xl glass text-xs font-black shadow-sm active:scale-95 transition-all"
          style={{ color: settings.app_icon_color }} // لون النص حسب إعدادات الأدمن
        >
          <LogIn className="w-4 h-4" /> دخول
        </button>
      </header>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 text-center max-w-sm flex flex-col items-center gap-8 mt-10 anim-slide-up">
        
        {/* أيقونة التطبيق */}
        <div className="relative">
          <div className="w-20 h-20 rounded-[2.2rem] glass-thick flex items-center justify-center border border-white/50 shadow-2xl">
            <MessageCircle className="w-10 h-10 opacity-80" style={{ color: settings.app_icon_color }} />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 animate-pulse" style={{ color: settings.app_icon_color + '66' }} />
        </div>

        <div>
           {/* اسم التطبيق المحقون من Supabase */}
           <h1 className="text-4xl font-black tracking-tighter italic leading-tight mb-3 uppercase"
               style={{ color: settings.app_icon_color }}>
            {appName}
            <span className="text-5xl" style={{ opacity: 0.4 }}>.</span>
           </h1>
           {/* الشعار (Tagline) المحقون من Supabase */}
           <p className="text-[11px] font-bold tracking-[0.2em] leading-relaxed uppercase px-4"
              style={{ color: settings.app_icon_color + '99' }}>
            {appTagline}
           </p>
        </div>

        {/* مميزات بسيطة */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <div className="px-4 py-2 rounded-full glass border border-white/20 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" style={{ color: settings.app_icon_color }} />
            <span className="text-[9px] font-black uppercase" style={{ color: settings.app_icon_color }}>غرف عامة</span>
          </div>
          <div className="px-4 py-2 rounded-full glass border border-white/20 flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5" style={{ color: settings.app_icon_color }} />
            <span className="text-[9px] font-black uppercase" style={{ color: settings.app_icon_color }}>دردشة خاصة</span>
          </div>
        </div>
      </div>

      {/* زر ابدأ الآن - يعتمد على لون الزر المختار من اللوحة */}
      <div className="relative z-10 w-full max-w-xs mb-6 anim-slide-up" style={{ animationDelay: "0.2s" }}>
        <button
          onClick={() => navigate("/auth?mode=signup")}
          className="w-full h-16 rounded-[2.5rem] text-white font-black text-sm shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all group"
          style={{ backgroundColor: settings.app_button_color }} // لون الزر المحقون
        >
          ابدأ الآن
          <ChevronLeft className="w-5 h-5 opacity-50 group-hover:translate-x-[-4px] transition-transform" />
        </button>
      </div>

      {/* الاستايلات والأنيميشن */}
      <style>{`
        .blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.3; animation: blob-move 20s ease-in-out infinite; }
        .blob-1 { width: 600px; height: 600px; top: -250px; right: -200px; }
        .blob-2 { width: 500px; height: 500px; bottom: -200px; left: -150px; animation-delay: -5s; }
        .blob-3 { width: 400px; height: 400px; top: 20%; left: -150px; animation-delay: -10s; }
        .liquid-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 100%); }
        @keyframes blob-move { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 33% { transform: translate(30px, 50px) rotate(10deg); } 66% { transform: translate(-20px, -40px) rotate(-10deg); } }
        .anim-slide-up { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
          }
