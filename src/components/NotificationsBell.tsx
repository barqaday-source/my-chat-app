// ====================================================================
// NotificationsBell - أيقونة جرس + قائمة منسدلة بالإشعارات
// ====================================================================

import { useState } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationsCenter } from "@/hooks/useNotificationsCenter";
import { useNavigate } from "react-router-dom";

export default function NotificationsBell() {
  const { user } = useAuth();
  const { items, unreadCount, markRead, markAllRead, remove } = useNotificationsCenter(user?.id ?? null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 relative"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-[88%] max-w-sm bg-card z-50 anim-slide-up safe-top safe-bottom flex flex-col">
            <header className="h-[65px] px-5 flex items-center justify-between border-b border-border/50">
              <h3 className="font-bold">الإشعارات</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-muted-foreground px-2 py-1 hover:text-foreground"
                  >
                    تعليم الكل كمقروء
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-2"><X className="w-5 h-5" /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-16 text-sm text-muted-foreground">
                  <Bell className="w-10 h-10 mx-auto opacity-30 mb-3" />
                  لا توجد إشعارات بعد
                </div>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) markRead(n.id);
                      if (n.link) {
                        setOpen(false);
                        navigate(n.link);
                      }
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition group ${
                      n.is_read ? "bg-background/50" : "bg-primary/20 border border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(n.created_at).toLocaleString("ar", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        {!n.is_read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                            className="p-1 text-muted-foreground hover:text-success"
                            aria-label="تعليم كمقروء"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                          className="p-1 text-muted-foreground hover:text-destructive"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
