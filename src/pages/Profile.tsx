import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; 
import { supabase } from "@/server/supabase";
import AppShell from @./components/AppShell";
import UserAvatar from "@/components/UserAvatar";
import { 
  Camera, Loader2, Save, Settings, LogOut, ChevronLeft, 
  Heart, Mail, Palette, Star 
} from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, signOut } = useAuth();
  
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    hobby: "",
    gender: "ذكر",
    zodiac: "الحمل"
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.display_name ?? "",
        bio: profile.bio ?? "",
        hobby: profile.hobby ?? "",
        gender: profile.gender ?? "ذكر",
        zodiac: profile.zodiac ?? "الحمل"
      });
    }
  }, [profile]);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      await refreshProfile();
      toast.success("تم تحديث صورتك!");
    } catch (error: any) {
      toast.error("خطأ في الرفع");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.displayName,
          bio: formData.bio,
          hobby: formData.hobby,
          gender: formData.gender,
          zodiac: formData.zodiac,
          updated_at: new Date()
        })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("تم الحفظ بنجاح!");
    } catch (error: any) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen pb-32 page-transition relative overflow-x-hidden">
        <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 z-[60] glass-thick">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-lg font-black text-primary tracking-tighter italic uppercase">My Profile</h1>
          <button onClick={() => setShowSettings(!showSettings)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </button>
        </header>

        <section className="px-6 mt-6 flex flex-col items-center">
          <div className="relative">
            <div className="p-1.5 rounded-[3.5rem] border-4 border-white shadow-2xl bg-gradient-to-tr from-primary/20 to-transparent">
              <UserAvatar src={profile?.avatar_url} name={profile?.display_name} size="2xl" className="w-36 h-36 rounded-[3rem]" />
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-11 h-11 rounded-2xl btn-gradient text-white flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </button>
            <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleUploadAvatar} />
          </div>
          <div className="text-center mt-6">
            <h2 className="text-2xl font-black">{formData.displayName || "الوحش"}</h2>
          </div>
        </section>

        <section className="px-6 mt-8 space-y-4">
          <div className="glass-thick rounded-[2.5rem] p-6 space-y-5">
             <input value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className="w-full h-12 px-5 rounded-2xl glass outline-none" placeholder="الاسم" />
             <button onClick={handleSave} disabled={saving} className="w-full h-14 rounded-2xl btn-gradient text-white font-black">
               {saving ? <Loader2 className="animate-spin" /> : "حفظ التغييرات"}
             </button>
          </div>
        </section>

        {showSettings && (
          <div className="absolute top-20 left-6 w-64 glass-thick rounded-[2.5rem] shadow-2xl p-4 z-[80]">
             <button onClick={signOut} className="w-full flex items-center gap-3 p-3.5 text-destructive font-bold">
               <LogOut className="w-4 h-4" /> خروج
             </button>
          </div>
        )}
      </div>
    </AppShell>
  );
      }
      
