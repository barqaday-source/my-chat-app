// ====================================================================
// Auth - بوابة الدخول (إصدار الوحش السماوي الزجاجي - المصلح)
// ====================================================================

import { useState, FormEvent } from "react";
// ✅ أضفنا Navigate هنا لضمان عمل التحويل التلقائي
import { useNavigate, useSearchParams, Navigate } from "react-router-dom"; 
import { useAuth } from "../hooks/useAuth";
import { useAppSettings } from "../hooks/useAppSettings";
// ✅ المسار النسبي الصحيح للخروج من مجلد pages والوصول لـ server
import { supabase } from "@/server/supabase";
import { 
  Loader2, Mail, Lock, User, Eye, EyeOff, 
  Sparkles, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const [params] = useSearchParams();
  const { user, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>(() => {
    const m = params.get("mode");
    return m === "signup" || m === "forgot" ? m : "login";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ استخدام حرف N كبير لضمان تعرف React Router عليه
  if (user && !loading) return <Navigate to="/chat" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, username);
        if (error) throw error;
        toast.success("تم إنشاء الحساب! افحص بريدك لتفعيله.");
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ ما");
    } finally {
      setSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6">
      
      {/* الخلفية الانسيابية */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="liquid-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-[400px] anim-slide-up">
        
        {/* الترويسة */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-[2rem] glass-thick border border-white/50 mb-4 shadow-2xl">
            <Sparkles className="w-8 h-8 text-[#007AFF] animate-pulse" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-br from-[#007AFF] to-[#4facfe] bg-clip-text text-transparent italic uppercase tracking-tighter">
            {mode === 'login' ? 'عودة حميدة' : mode === 'signup' ? 'وحش جديد' : 'استعادة'}
          </h1>
          <p className="text-[10px] font-bold text-[#007AFF]/50 uppercase tracking-[0.2em] mt-2">
            {mode === 'login' ? 'سجل دخولك لتكمل الدردشة' : 'انضم لمجتمعنا الفريد الآن'}
          </p>
        </div>

        {/* الفورم */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="group relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#007AFF] opacity-40 group-focus-within:opacity-100 transition" />
              <input 
                type="text" placeholder="اسم المستخدم" required
                value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 pr-12 pl-4 rounded-2xl glass border border-white/40 outline-none text-sm font-bold focus:ring-2 ring-[#007AFF]/20 transition-all placeholder:text-[#007AFF]/20"
              />
            </div>
          )}

          <div className="group relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#007AFF] opacity-40 group-focus-within:opacity-100 transition" />
            <input 
              type="email" placeholder="البريد الإلكتروني" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 pr-12 pl-4 rounded-2xl glass border border-white/40 outline-none text-sm font-bold focus:ring-2 ring-[#007AFF]/20 transition-all placeholder:text-[#007AFF]/20"
            />
          </div>

          <div className="group relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#007AFF] opacity-40 group-focus-within:opacity-100 transition" />
            <input 
              type={showPassword ? "text" : "password"} placeholder="كلمة المرور" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 pr-12 pl-12 rounded-2xl glass border border-white/40 outline-none text-sm font-bold focus:ring-2 ring-[#007AFF]/20 transition-all placeholder:text-[#007AFF]/20"
            />
            <button 
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button 
            disabled={submitting}
            className="w-full h-15 mt-4 rounded-3xl btn-gradient text-white font-black text-sm shadow-xl shadow-[#007AFF]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 group"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8 opacity-20">
          <div className="h-[1px] flex-1 bg-[#007AFF]" />
          <span className="text-[10px] font-black uppercase">أو من خلال</span>
          <div className="h-[1px] flex-1 bg-[#007AFF]" />
        </div>

        <button 
          onClick={signInWithGoogle}
          className="w-full h-14 rounded-2xl glass border border-white/60 flex items-center justify-center gap-3 font-bold text-xs hover:bg-white/50 transition active:scale-[0.98] shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="google" />
          متابعة باستخدام جوجل
        </button>

        <div className="text-center mt-10">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[11px] font-black text-[#007AFF] uppercase tracking-widest hover:underline"
          >
            {mode === 'login' ? 'ليس لديك حساب؟ سجل الآن' : 'بالفعل تملك حساباً؟ دخول'}
          </button>
        </div>
      </div>

      <style>{`
        .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.4; animation: float 20s infinite; }
        .blob-1 { width: 500px; height: 500px; background: #D0E9FF; top: -10%; right: -10%; }
        .blob-2 { width: 400px; height: 400px; background: #B6D6FF; bottom: -10%; left: -10%; animation-delay: -5s; }
        .liquid-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.7)); }
        @keyframes float { 
          0%, 100% { transform: translate(0,0) scale(1); } 
          50% { transform: translate(20px, -40px) scale(1.1); } 
        }
        .h-15 { height: 3.75rem; }
      `}</style>
    </div>
  );
                                   }
      
