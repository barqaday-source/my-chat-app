// ====================================================================
// UserDashboard - لوحة تحكم المستخدم (إحصائيات نشاطه)
// ====================================================================

import { useEffect, useState } from "react";
import { supabase } from "@/server/supabase";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/AppShell";
import { MessageSquare, LayoutGrid, Calendar, TrendingUp } from "lucide-react";

interface Stats {
  myMessages: number;
  myRooms: number;
  joinedAt: string | null;
  todayMessages: number;
}

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ myMessages: 0, myRooms: 0, joinedAt: null, todayMessages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);

    Promise.all([
      supabase.from("messages").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("rooms").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
      supabase.from("messages").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", today.toISOString()),
    ]).then(([msgs, rooms, todayMsgs]) => {
      setStats({
        myMessages: msgs.count ?? 0,
        myRooms: rooms.count ?? 0,
        todayMessages: todayMsgs.count ?? 0,
        joinedAt: profile?.created_at ?? null,
      });
      setLoading(false);
    });
  }, [user, profile]);

  const cards = [
    { icon: MessageSquare, label: "إجمالي رسائلك",  value: stats.myMessages },
    { icon: TrendingUp,    label: "رسائل اليوم",     value: stats.todayMessages },
    { icon: LayoutGrid,    label: "غرفك",            value: stats.myRooms },
    { icon: Calendar,      label: "عضو منذ",         value: stats.joinedAt ? new Date(stats.joinedAt).toLocaleDateString("ar") : "—" },
  ];

  return (
    <AppShell>
      <div className="p-5 anim-fade-in">
        <h4 className="font-bold text-lg mb-1">لوحتي</h4>
        <p className="text-sm text-muted-foreground mb-5">نظرة سريعة على نشاطك</p>

        <div className="grid grid-cols-2 gap-3">
          {cards.map((card, i) => (
            <div key={i} className="bg-foreground text-background p-5 rounded-3xl">
              <card.icon className="w-5 h-5 opacity-60 mb-3" />
              <p className="text-[11px] opacity-60">{card.label}</p>
              <p className="text-xl font-bold mt-1">{loading ? "..." : card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 glass rounded-3xl p-5">
          <p className="font-semibold mb-2">💡 نصيحة</p>
          <p className="text-sm text-muted-foreground">
            أنشئ غرفتك الخاصة وادعُ أصدقاءك للدردشة الفورية.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
