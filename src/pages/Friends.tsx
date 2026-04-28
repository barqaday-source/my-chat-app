import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/server/supabase";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/AppShell";
import UserAvatar from "@/components/UserAvatar";
import { 
  ArrowRight, Send, MoreVertical, Search,
  Loader2, MessageCircle, Camera
} from "lucide-react";
import { toast } from "sonner";

// ✅ 1. تعريف شكل المستخدم في المحادثة
interface ChatUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  lastMsg?: string;
  time?: string;
}

// ✅ 2. تعريف شكل الرسالة الخاصة
interface PrivateMessage {
  id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function Friends() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [chats, setChats] = useState<ChatUser[]>([]);

  // 1. جلب قائمة المحادثات النشطة
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url),
            receiver:profiles!messages_receiver_id_fkey(id, display_name, avatar_url)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const uniqueChats: ChatUser[] = [];
          const seenIds = new Set();
          
          data.forEach((msg: any) => {
            const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
            if (otherUser && !seenIds.has(otherUser.id)) {
              seenIds.add(otherUser.id);
              uniqueChats.push({ 
                id: otherUser.id,
                display_name: otherUser.display_name,
                avatar_url: otherUser.avatar_url,
                lastMsg: msg.content, 
                time: msg.created_at 
              });
            }
          });
          setChats(uniqueChats);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  // 2. جلب الرسائل عند فتح محادثة
  useEffect(() => {
    if (!selectedChat || !user) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedChat.id}),and(sender_id.eq.${selectedChat.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data as PrivateMessage[]);
      scrollToBottom();
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat_${selectedChat.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}` 
      }, (payload) => {
        if (payload.new.sender_id === selectedChat.id) {
          setMessages(prev => [...prev, payload.new as PrivateMessage]);
          scrollToBottom();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedChat, user]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  // 3. دالة إرسال الرسالة
  const sendMessage = async () => {
    if (!inputText.trim() || !user || !selectedChat) return;

    const tempMsg: PrivateMessage = {
      sender_id: user.id,
      receiver_id: selectedChat.id,
      content: inputText.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('messages').insert([tempMsg]);
      if (error) throw error;

      setMessages(prev => [...prev, tempMsg]);
      setInputText("");
      scrollToBottom();
    } catch (error) {
      toast.error("فشل إرسال الرسالة");
    }
  };

  if (selectedChat) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col max-w-[500px] mx-auto">
        <header className="h-20 px-4 glass-thick border-b border-white/20 flex items-center gap-3">
          <button onClick={() => setSelectedChat(null)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-primary" />
          </button>
          <div className="flex flex-1 items-center gap-3">
            <UserAvatar src={selectedChat.avatar_url} name={selectedChat.display_name} size="md" />
            <div>
              <h2 className="text-sm font-black">{selectedChat.display_name}</h2>
              <p className="text-[10px] font-bold text-green-500 uppercase">متصل الآن</p>
            </div>
          </div>
          <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <MoreVertical className="w-5 h-5 opacity-60" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
          {messages.map((m, idx) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={idx} className={`flex flex-col ${mine ? 'items-end' : 'items-start'} animate-in fade-in duration-300`}>
                <div className={`px-5 py-3 rounded-[1.8rem] text-sm font-bold shadow-sm max-w-[85%] ${
                  mine 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'glass-thick text-foreground rounded-tl-none border-white/40'
                }`}
                style={{ backgroundColor: mine ? 'var(--app-btn)' : '' }}>
                  {m.content}
                </div>
                <span className="text-[8px] opacity-30 mt-1 px-2 font-black uppercase">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        <footer className="p-4 bg-transparent">
          <div className="glass-thick rounded-[2.5rem] p-2 flex items-center gap-2 border border-white/50 shadow-2xl">
            <button className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-primary">
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="text" value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="اكتب رسالة وحشية..." 
              className="flex-1 bg-transparent outline-none text-sm px-2 font-bold"
            />
            <button onClick={sendMessage} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white"
            style={{ backgroundColor: 'var(--app-btn)' }}>
              <Send className="w-5 h-5" />
            </button>
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
            <h1 className="text-2xl font-black text-primary italic uppercase tracking-tighter" style={{ color: 'var(--app-icon)' }}>Chats</h1>
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
          ) : chats.length > 0 ? (
            chats.map(chat => (
              <div key={chat.id} onClick={() => setSelectedChat(chat)} className="glass-thick p-4 rounded-[2.5rem] flex items-center gap-4 border border-white/40 active:scale-[0.97] transition-all cursor-pointer hover:bg-white/40">
                <UserAvatar src={chat.avatar_url} name={chat.display_name} size="lg" className="rounded-[1.5rem]" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-black text-foreground truncate">{chat.display_name}</h3>
                    <span className="text-[8px] font-black opacity-30 uppercase whitespace-nowrap">
                      {chat.time ? new Date(chat.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ""}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold opacity-40 truncate">{chat.lastMsg}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 opacity-20 italic text-xs font-black">لا توجد محادثات نشطة بعد.. ابدأ الدردشة!</div>
          )}
        </section>
      </div>
    </AppShell>
  );
      }
                
