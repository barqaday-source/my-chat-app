// ====================================================================
// Friends - نظام المحادثات الخاصة 1v1 (المربوط بـ Supabase Realtime)
// ====================================================================

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/server/supabase";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/AppShell";
import UserAvatar from "@/components/UserAvatar";
import { 
  ArrowRight, Send, MoreVertical, Ban, ShieldAlert, 
  PushPin, Trash2, CheckCheck, Camera, Search,
  Loader2, MessageCircle
} from "lucide-react";
import { toast } from "sonner";

export default function Friends() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [chats, setChats] = useState<any[]>([]); // قائمة المحادثات النشطة

  // 1. جلب قائمة الأشخاص الذين تواصلت معهم (Recent Chats)
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      // جلب آخر الرسائل لتعريف المحادثات النشطة
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, display_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (data) {
        // تصفية البيانات لإظهار كل مستخدم مرة واحدة كـ "دردشة"
        const uniqueChats: any[] = [];
        const seenIds = new Set();
        data.forEach(msg => {
          const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
          if (otherUser && !seenIds.has(otherUser.id)) {
            seenIds.add(otherUser.id);
            uniqueChats.push({ ...otherUser, lastMsg: msg.content, time: msg.created_at });
          }
        });
        setChats(uniqueChats);
      }
      setLoading(false);
    };

    fetchChats();
  }, [user]);

  // 2. جلب الرسائل والاشتراك في الـ Realtime عند فتح محادثة
  useEffect(() => {
    if (!selectedChat || !user) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedChat.id}),and(sender_id.eq.${selectedChat.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
      scrollToBottom();
    };

    fetchMessages();

    // الاشتراك اللحظي في الرسائل الجديدة
    const channel = supabase
      .channel(`chat_${selectedChat.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}` 
      }, (payload) => {
        if (payload.new.sender_id === selectedChat.id) {
          setMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedChat, user]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  // 3. دالة إرسال الرسالة الحقيقية للسيرفر
  const sendMessage = async () => {
    if (!inputText.trim() || !user || !selectedChat) return;

    const tempMsg = {
      sender_id: user.id,
      receiver_id: selectedChat.id,
      content: inputText,
      created_at: new Date().toISOString(),
    };

    // إرسال للسوبابيس
    const { error } = await supabase.from('messages').insert([tempMsg]);

    if (error) {
      toast.error("فشل إرسال الرسالة");
    } else {
      setMessages(prev => [...prev, tempMsg]);
      setInputText("");
      scrollToBottom();
    }
  };

  if (selectedChat) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col max-w-[500px] mx-auto">
        <header className="h-20 px-4 glass-thick border-b border-white/20 flex items-center gap-3">
          <button onClick={() => setSelectedChat(null)} className="w-10 h-10 rounded-full glass flex items-center justify-center"><ArrowRight className="w-5 h-5 text-primary" /></button>
          <div className="flex flex-1 items-center gap-3">
            <UserAvatar src={selectedChat.avatar_url} name={selectedChat.display_name} size="md" />
            <div>
              <h2 className="text-sm font-black">{selectedChat.display_name}</h2>
              <p className="text-[10px] font-bold text-success uppercase">متصل الآن</p>
            </div>
          </div>
          <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 rounded-full glass flex items-center justify-center"><MoreVertical className="w-5 h-5 opacity-60" /></button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--app-bg)]/20">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender_id === user?.id ? 'items-end' : 'items-start'} anim-fade-in`}>
              <div className={`px-5 py-3 rounded-[1.8rem] text-sm font-bold shadow-sm max-w-[85%] ${
                m.sender_id === user?.id 
                ? 'bg-[var(--app-btn)] text-white rounded-tr-none' 
                : 'glass-thick text-foreground rounded-tl-none border-white/40'
              }`}>
                {m.content}
              </div>
              <span className="text-[8px] opacity-30 mt-1 px-2 font-black uppercase">
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>

        <footer className="p-4 bg-transparent">
          <div className="glass-thick rounded-[2.5rem] p-2 flex items-center gap-2 border border-white/50 shadow-2xl">
            <button className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-primary"><Camera className="w-5 h-5" /></button>
            <input 
              type="text" value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="اكتب رسالة وحشية..." 
              className="flex-1 bg-transparent outline-none text-sm px-2 font-bold"
            />
            <button onClick={sendMessage} className="w-12 h-12 rounded-full btn-gradient flex items-center justify-center text-white"><Send className="w-5 h-5" /></button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen pb-32">
        <header className="px-6 pt-10 pb-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-primary italic uppercase tracking-tighter">Chats</h1>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary"><Search className="w-5 h-5" /></button>
              <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary"><MessageCircle className="w-5 h-5" /></button>
            </div>
          </div>
          <input type="text" placeholder="ابحث عن وحش..." className="w-full h-14 px-6 rounded-[1.8rem] glass-thick outline-none text-xs font-bold border border-white/20" />
        </header>

        <section className="px-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : chats.map(chat => (
            <div key={chat.id} onClick={() => setSelectedChat(chat)} className="glass-thick p-4 rounded-[2.5rem] flex items-center gap-4 border border-white/40 active:scale-[0.97] transition-all cursor-pointer">
              <UserAvatar src={chat.avatar_url} name={chat.display_name} size="lg" className="rounded-[1.5rem]" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-black text-foreground">{chat.display_name}</h3>
                  <span className="text-[8px] font-black opacity-30 uppercase">{new Date(chat.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-[11px] font-bold opacity-40 truncate">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
