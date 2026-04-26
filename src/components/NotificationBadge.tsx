import { useEffect, useState } from "react";
import { supabase } from "@/server/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationBadge() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      const { count: unreadCount } = await supabase
        .from("notifications")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setCount(unreadCount || 0);
    };

    fetchCount();

    const channel = supabase.channel('badge-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}` 
      }, () => {
        setCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-white text-[10px] font-black flex items-center justify-center animate-bounce text-white">
      {count > 9 ? "+9" : count}
    </span>
  );
}
