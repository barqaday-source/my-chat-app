import { useEffect, useState } from "react";
import { supabase } from "@/server/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // 1. حساب الإشعارات غير المقروءة عند التحميل
  const getUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    
    setUnreadCount(count || 0);
  };

  useEffect(() => {
    getUnreadCount();

    // 2. تفعيل Realtime: تحديث العداد فوراً عند وصول إشعار جديد
    const channel = supabase.channel('header_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        setUnreadCount(prev => prev + 1); // زيادة العداد تلقائياً
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <header className="flex justify-between items-center p-4 bg-transparent">
      {/* باقي عناصر الهيدر (اللوجو/الاسم) */}
      
      <button 
        onClick={() => navigate('/notifications')} 
        className="relative w-12 h-12 rounded-2xl glass flex items-center justify-center transition-transform active:scale-90"
      >
        <Bell className="w-6 h-6 text-white/80" />
        
        {/* الدائرة الحمراء (تظهر فقط إذا كان هناك إشعارات) */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-[#050505] text-[10px] font-black flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? "+9" : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}
