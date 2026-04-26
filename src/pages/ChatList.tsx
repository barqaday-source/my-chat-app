// ====================================================================
// ChatList - نسخة الوحش (مربوطة بالمدن والغرف الحقيقية)
// ====================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../server/supabase";
import { useAuth } from "../hooks/useAuth";
import AppShell from "../components/AppShell";
import UserAvatar from "../components/UserAvatar";
import { 
  Bell, Loader2, MessageCircle, Search, MapPin, 
  Lock, Plus, MoreHorizontal 
} from "lucide-react";

// قائمة المدن (مزامنة مع خيارات إنشاء الغرف)
const CITIES = ["الكل", "بغداد", "البصرة", "الموصل", "أربيل", "النجف"];

export default function ChatList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("الكل");

  // 1. جلب الغرف والمستخدمين النشطين من سوبابيس
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // جلب الغرف المعتمدة فقط
      const { data: roomsData } = await supabase
        .from("rooms")
        .select("*")
        .order("created_at", { ascending: false });

      // جلب المستخدمين الذين تفاعلوا في آخر 10 دقائق
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, last_seen")
        .gt("last_seen", tenMinsAgo)
        .limit(15);

      if (roomsData) setRooms(roomsData);
      if (usersData) setActiveUsers(usersData);
      setLoading(false);
    };

    loadData();

    // الاشتراك في التغييرات اللحظية للغرف (إضافة/حذف غرف)
    const channel = supabase.channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => loadData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. منطق الفلترة (بحث + مدينة)
  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "الكل" || r.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <AppShell>
      <div className="pb-28 page-transition bg-transparent">
        {/* Header - يستخدم لون الأيقونات المختار من الأدمن */}
        <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 z-50 glass-thick border-b border-white/20">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter leading-none text-primary" style={{ color: 'var(--app-icon)' }}>EXPLORE</h1>
            <p className="text-[10px] font-bold opacity-40 uppercase mt-1">عالمك بلمسة واحدة</p>
          </div>
          <div className="flex gap-2">
             <button onClick={() => navigate('/create-room')} className="w-11 h-11 rounded-2xl btn-gradient flex items-center justify-center shadow-lg active:scale-90 transition" style={{ backgroundColor: 'var(--app-btn)' }}>
                <Plus className="w-6 h-6 text-white" />
             </button>
          </div>
        </header>

        {/* شريط البحث */}
        <div className="px-6 mt-6">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:text-primary transition-all" />
            <input 
              type="text"
              placeholder="ابحث عن غرفة أو مدينة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pr-12 pl-4 rounded-[1.5rem] glass border border-white/40 outline-none text-sm font-bold focus:ring-2 ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* المتواجدون الآن */}
        <section className="mt-8">
          <div className="px-6 flex items-center justify-between mb-4">
            <h2 className="text-xs font-black opacity-30 uppercase tracking-widest">نشط الآن</h2>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
          <div className="flex gap-5 overflow-x-auto px-6 no-scrollbar pb-2">
            {activeUsers.length > 0 ? activeUsers.map(u => (
              <div key={u.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer">
                <div className="p-0.5 rounded-full border-2 border-primary/20">
                  <UserAvatar src={u.avatar_url} name={u.display_name} size="lg" />
                </div>
                <span className="text-[9px] font-black opacity-70 truncate max-w-[60px]">{u.display_name}</span>
              </div>
            )) : (
              <p className="text-[10px] font-bold opacity-20 px-2 italic">لا يوجد وحوش متصلين حالياً..</p>
            )}
          </div>
        </section>

        {/* فلتر المدن */}
        <section className="mt-8 px-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-5 h-10 rounded-full text-[11px] font-black whitespace-nowrap transition-all ${
                  selectedCity === city 
                  ? 'text-white shadow-md scale-105' 
                  : 'glass text-primary/60 hover:bg-white/50'
                }`}
                style={{ backgroundColor: selectedCity === city ? 'var(--app-btn)' : '' }}
              >
                {city}
              </button>
            ))}
          </div>
        </section>

        {/* قائمة الغرف */}
        <section className="px-4 mt-8 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-20 opacity-20">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-xs font-bold">جاري استدعاء الغرف...</p>
            </div>
          ) : filteredRooms.map(room => (
            <div
              key={room.id}
              onClick={() => navigate(`/chat/${room.id}`)}
              className="group relative glass-thick p-5 rounded-[2.2rem] flex gap-4 cursor-pointer hover:bg-white/60 transition-all active:scale-[0.97] border border-white/40"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center border border-white/50 bg-primary/5 shadow-inner overflow-hidden">
                  {room.cover_url ? (
                    <img src={room.cover_url} className="w-full h-full object-cover" />
                  ) : (
                    <MessageCircle className="w-8 h-8 text-primary opacity-40" />
                  )}
                </div>
                {room.is_closed && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-foreground/90 truncate">{room.name}</h3>
                  <MoreHorizontal className="w-4 h-4 opacity-20" />
                </div>
                <p className="text-[11px] font-medium text-muted-foreground line-clamp-1 mt-1">{room.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 bg-white/40 px-2.5 py-1 rounded-xl border border-white/50">
                    <MapPin className="w-3 h-3 text-primary" style={{ color: 'var(--app-icon)' }} />
                    <span className="text-[10px] font-black text-primary/80" style={{ color: 'var(--app-icon)' }}>{room.city || "عام"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
