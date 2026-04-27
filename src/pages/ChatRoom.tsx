// ====================================================================
// ChatRoom - النسخة الحية المربوطة بسوبابيس (إصدار الوحش الكامل)
// ====================================================================

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// ✅ استخدام المسارات النسبية بدلاً من @
import { supabase } from "@/server/supabase"; 
import { useAuth } from "@/hooks/useAuth"; 
import UserAvatar from "@/components/UserAvatar"; 
import { 
  ArrowRight, Send, Loader2, Settings2, Users, Trash2, 
  MoreVertical, Ban, Flag, Palette, Edit3, DoorClosed
} from "lucide-react";
import { toast } from "sonner";


export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [actionMsgId, setActionMsgId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. جلب بيانات الغرفة والرسائل عند التحميل
  useEffect(() => {
    if (!roomId) return;

    const fetchRoomData = async () => {
      const { data } = await supabase.from("rooms").select("*").eq("id", roomId).single();
      setRoom(data);
    };

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select(`*, profiles(display_name, avatar_url)`)
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
      scrollToBottom();
    };

    fetchRoomData();
    fetchMessages();

    // 2. تفعيل الاستقبال اللحظي للرسائل (Realtime)
    const channel = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `room_id=eq.${roomId}` 
      }, (payload) => {
        // جلب بروفايل المرسل للرسالة الجديدة
        supabase.from("profiles").select("display_name, avatar_url").eq("id", payload.new.sender_id).single()
          .then(({ data }) => {
            const newMsg = { ...payload.new, profiles: data };
            setMessages(prev => [...prev, newMsg]);
            scrollToBottom();
          });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
  };

  // 3. دالة إرسال الرسالة
  const handleSendMessage = async () => {
    if (!input.trim() || !user || !roomId) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert([{
      room_id: roomId,
      sender_id: user.id,
      content: input.trim()
    }]);

    if (error) {
      toast.error("فشل إرسال الرسالة");
    } else {
      setInput("");
    }
    setSending(false);
  };

  // 4. دالة حذف الرسالة (للأدمن أو صاحب الرسالة)
  const handleDeleteMessage = async (msgId: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", msgId);
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      setActionMsgId(null);
      toast.success("تم حذف الرسالة");
    }
  };

  const isOwner = user?.id === room?.owner_id;
  const isStaff = isOwner || isAdmin;

  return (
    <div className="min-h-screen flex flex-col max-w-[500px] mx-auto bg-[var(--app-bg)] relative">
      {/* Header */}
      <header className="h-[75px] px-4 flex items-center gap-3 glass-thick sticky top-0 z-[60] border-b border-white/30">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center shadow-lg active:scale-90 transition">
          <ArrowRight className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-sm truncate leading-tight text-primary" style={{ color: 'var(--app-icon)' }}>{room?.name || "تحميل..."}</h2>
          <p className="text-[10px] font-bold opacity-60">غرفة محادثة عامة</p>
        </div>

        <button onClick={() => setShowRoomMenu(!showRoomMenu)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <MoreVertical className="w-5 h-5 opacity-60" />
        </button>

        {showRoomMenu && (
          <div className="absolute top-[80px] left-4 w-[220px] glass-thick rounded-[2rem] shadow-2xl p-3 z-[80] border border-white/50 anim-scale-in">
             <button onClick={() => navigate(`/rooms/${roomId}/members`)} className="w-full flex items-center gap-3 p-3 hover:bg-primary/10 rounded-2xl transition text-sm font-bold">
                <Users className="w-4 h-4 text-primary" /> الأعضاء
             </button>
             {isStaff && (
               <button className="w-full flex items-center gap-3 p-3 hover:bg-destructive/10 rounded-2xl transition text-sm font-bold text-destructive">
                 <DoorClosed className="w-4 h-4" /> إغلاق الغرفة
               </button>
             )}
          </div>
        )}
      </header>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        {messages.map((msg) => {
          const mine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex gap-2 anim-fade-in ${mine ? "flex-row-reverse" : ""}`}>
              <UserAvatar src={msg.profiles?.avatar_url} name={msg.profiles?.display_name} size="sm" />
              <div className={`max-w-[80%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                <div 
                  onClick={() => setActionMsgId(msg.id)}
                  className={`px-4 py-2.5 rounded-[1.8rem] text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer ${
                    mine ? "text-white rounded-tr-none" : "glass-card bg-white/80 rounded-tl-none text-black"
                  }`}
                  style={{ backgroundColor: mine ? 'var(--app-btn)' : '' }}
                >
                  {msg.content}
                </div>
                <span className="text-[8px] opacity-40 mt-1 font-black uppercase">
                   {msg.profiles?.display_name} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Actions Modal */}
      {actionMsgId && (
        <div className="fixed inset-0 z-[110] flex items-end p-6 bg-black/20 backdrop-blur-sm" onClick={() => setActionMsgId(null)}>
          <div className="w-full max-w-[450px] mx-auto glass-thick rounded-[2.5rem] p-4 anim-slide-up border border-white/60 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              {(isStaff || messages.find(m => m.id === actionMsgId)?.sender_id === user?.id) && (
                <button onClick={() => handleDeleteMessage(actionMsgId)} className="flex flex-col items-center gap-2 p-4 glass rounded-3xl text-destructive">
                  <Trash2 className="w-5 h-5" />
                  <span className="text-[10px] font-black">حذف الرسالة</span>
                </button>
              )}
              <button className="flex flex-col items-center gap-2 p-4 glass rounded-3xl text-orange-500">
                <Ban className="w-5 h-5" />
                <span className="text-[10px] font-black">حظر</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <footer className="p-3 fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto z-50">
        <div className="glass-thick rounded-[2.5rem] p-2 flex items-center gap-2 border border-white/50 shadow-xl">
           <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب شيئاً وحشياً..." 
              className="flex-1 bg-transparent outline-none text-sm px-4 font-bold"
            />
           <button 
             onClick={handleSendMessage}
             disabled={sending}
             className="w-12 h-12 rounded-full btn-gradient flex items-center justify-center text-white shadow-md active:scale-90 transition"
             style={{ backgroundColor: 'var(--app-btn)' }}
           >
             {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
           </button>
        </div>
      </footer>
    </div>
  );
}
