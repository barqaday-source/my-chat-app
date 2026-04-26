// ====================================================================
// EditRoom - تعديل غرفة (لمالك الغرفة فقط)
// ====================================================================

import { useEffect, useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase, type Room } from "@/server/supabase";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/AppShell";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function EditRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    supabase.from("rooms").select("*").eq("id", roomId).maybeSingle().then(({ data }) => {
      if (data) {
        const r = data as Room;
        setRoom(r);
        setName(r.name); setDescription(r.description ?? "");
        setCoverUrl(r.cover_url ?? ""); setLink(r.link ?? "");
      }
      setLoading(false);
    });
  }, [roomId]);

  if (loading) return <AppShell><div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div></AppShell>;
  if (!room) return <AppShell><div className="p-8 text-center">الغرفة غير موجودة</div></AppShell>;
  if (room.owner_id !== user?.id) return <AppShell><div className="p-8 text-center text-destructive">لا تملك صلاحية تعديل هذه الغرفة</div></AppShell>;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("rooms").update({
      name: name.trim(),
      description: description.trim() || null,
      cover_url: coverUrl.trim() || null,
      link: link.trim() || null,
    }).eq("id", room.id);
    setSaving(false);
    if (error) toast.error("فشل الحفظ", { description: error.message });
    else { toast.success("تم الحفظ"); navigate(`/chat/${room.id}`); }
  };

  const handleDelete = async () => {
    if (!confirm("هل تريد حذف الغرفة؟ سيتم حذف كل الرسائل.")) return;
    const { error } = await supabase.from("rooms").delete().eq("id", room.id);
    if (error) toast.error("فشل الحذف", { description: error.message });
    else { toast.success("حُذفت الغرفة"); navigate("/rooms"); }
  };

  return (
    <AppShell>
      <div className="p-4 anim-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2"><ArrowRight className="w-5 h-5" /></button>
          <h2 className="font-bold text-lg">تعديل الغرفة</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground px-1 mb-1 block">اسم الغرفة</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={50}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground px-1 mb-1 block">الوصف</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} rows={3}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border outline-none text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground px-1 mb-1 block">رابط صورة الخلفية</label>
            <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} type="url" placeholder="https://..."
              dir="ltr" className="w-full h-12 px-4 rounded-xl bg-card border border-border outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground px-1 mb-1 block">رابط مخصص (اختياري)</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} type="url" placeholder="https://..."
              dir="ltr" className="w-full h-12 px-4 rounded-xl bg-card border border-border outline-none text-sm" />
          </div>

          <button type="submit" disabled={saving}
            className="w-full h-12 rounded-xl bg-foreground text-background font-semibold disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "حفظ التعديلات"}
          </button>

          <button type="button" onClick={handleDelete}
            className="w-full h-12 rounded-xl bg-destructive/10 text-destructive font-semibold flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> حذف الغرفة
          </button>
        </form>
      </div>
    </AppShell>
  );
}
