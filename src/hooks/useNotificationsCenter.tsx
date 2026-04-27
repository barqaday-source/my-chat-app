// ====================================================================
// useNotificationsCenter - النسخة المعتمدة والمطابقة لقاعدة البيانات
// ====================================================================

import { useCallback, useEffect, useRef, useState } from "react";
// ✅ التصحيح: توحيد المسار النسبي لضمان عبور السيرفر بنجاح
import { supabase, type AppNotification } from "../server/supabase"; 
import { toast } from "sonner";

export function useNotificationsCenter(userId: string | null) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const channelId = useRef(`notif:${crypto.randomUUID()}`);

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setItems((data as AppNotification[]) ?? []);
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    if (!userId) return;

    // ✅ الاشتراك في الإشعارات اللحظية مع فلترة دقيقة للمستخدم الحالي
    const ch = supabase
      .channel(`${channelId.current}:${userId}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "notifications", 
          filter: `user_id=eq.${userId}` 
        },
        (payload) => {
          const n = payload.new as AppNotification;
          setItems((prev) => [n, ...prev].slice(0, 50));
          
          // تفعيل التنبيه المنبثق
          toast.success(n.title, { 
            description: n.body ?? undefined, 
            duration: 4000 
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId, refresh]);

  const unreadCount = items.filter((i) => !i.is_read).length;

  const markRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setItems((p) => p.map((i) => (i.id === id ? { ...i, is_read: true } : i)));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    setItems((p) => p.map((i) => ({ ...i, is_read: true })));
  }, [userId]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setItems((p) => p.filter((i) => i.id !== id));
  }, []);

  return { items, loading, unreadCount, refresh, markRead, markAllRead, remove };
}
