import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// تصحيح المسارات للعمل على السيرفر (Relative Paths)
import { useAuth } from "../hooks/useAuth"; 
import { supabase } from "../server/supabase"; 
import AppShell from "../components/AppShell";
import UserAvatar from "../components/UserAvatar";

  
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

  // 1. دالة رفع الصورة الشخصية (مُحسنة للـ Web)
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      // فحص الحجم (اختياري: يفضل أن لا تزيد عن 2MB للويب)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("حجم الصورة كبير جداً، اختر صورة أصغر من 2MB");
        return;
      }

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // رفع الملف
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // الحصول على الرابط
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // تحديث قاعدة البيانات
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success("تم تحديث صورتك بنجاح!");
    } catch (error: any) {
      toast.error("خطأ في الرفع: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 2. دالة حفظ البيانات
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
      toast.success("تم تحديث وحشيتك بنجاح!");
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
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-90 transition">
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-lg font-black text-primary tracking-tighter italic uppercase">My Beast Mode</h1>
          <button onClick={() => setShowSettings(!showSettings)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </button>
        </header>

        <section className="px-6 mt-6 flex flex-col items-center">
          <div className="relative group">
            <div className="p-1.5 rounded-[3.5rem] border-4 border-white shadow-2xl bg-gradient-to-tr from-primary/20 to-transparent">
              <UserAvatar src={profile?.avatar_url} name={profile?.display_name} size="2xl" className="w-36 h-36 rounded-[3rem]" />
              {uploading && (
                <div className="absolute inset-0 bg-black/40 rounded-[3rem] flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileRef.current?.click()} 
              disabled={uploading}
              className="absolute bottom-0 right-0 w-11 h-11 rounded-2xl btn-gradient text-white flex items-center justify-center shadow-lg border-4 border-background active:scale-90 transition"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleUploadAvatar} />
          </div>

          <div className="text-center mt-6">
            <h2 className="text-2xl font-black flex items-center gap-2 justify-center">
              {formData.displayName || "الوحش المجهول"}
              <Star className="w-4 h-4 text-primary fill-primary" />
            </h2>
            <p className="text-[10px] opacity-40 mt-1 font-bold uppercase tracking-widest">{formData.gender} • {formData.zodiac}</p>
          </div>
        </section>

        <section className="px-6 mt-8 space-y-4">
          <div className="glass-thick rounded-[2.5rem] p-6 space-y-5 shadow-inner">
             <div className="space-y-1">
                <label className="text-[10px] font-black opacity-30 px-2 uppercase">اسم العرض</label>
                <input 
                  value={formData.displayName} 
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full h-12 px-5 rounded-2xl glass outline-none font-bold text-xs"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black opacity-30 px-2 uppercase">الجنس</label>
                  <select 
                    value={formData.gender} 
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full h-12 px-4 rounded-2xl glass outline-none font-bold text-xs cursor-pointer appearance-none"
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black opacity-30 px-2 uppercase">البرج</label>
                  <input 
                    value={formData.zodiac} 
                    onChange={(e) => setFormData({...formData, zodiac: e.target.value})}
                    className="w-full h-12 px-4 rounded-2xl glass outline-none font-bold text-xs text-center"
                  />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-[10px] font-black opacity-30 px-2 uppercase italic">الهواية المفضلة</label>
                <div className="relative">
                  <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                  <input 
                    value={formData.hobby} 
                    onChange={(e) => setFormData({...formData, hobby: e.target.value})}
                    className="w-full h-12 px-5 pr-12 rounded-2xl glass outline-none font-bold text-xs"
                    placeholder="ماذا تحب أن تفعل؟"
                  />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-[10px] font-black opacity-30 px-2 uppercase italic">النبذة (Bio)</label>
                <textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full p-5 rounded-[2rem] glass outline-none font-bold text-xs resize-none"
                  rows={3}
                />
             </div>

             <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full h-14 rounded-2xl btn-gradient text-white font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition"
             >
               {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> حفظ وحشيتي</>}
             </button>
          </div>
        </section>

        {showSettings && (
          <div className="absolute top-20 left-6 w-64 glass-thick rounded-[2.5rem] shadow-2xl p-4 z-[80] anim-scale-in border border-white/50">
             <MenuAction icon={Mail} label="البريد" onClick={() => {}} />
             <MenuAction icon={Palette} label="السمات" onClick={() => navigate('/admin/themes')} />
             <div className="h-[1px] bg-primary/10 my-2" />
             <MenuAction icon={LogOut} label="خروج" onClick={signOut} color="text-destructive" />
          </div>
        )}
      </div>
    </AppShell>
  );
}

function MenuAction({ icon: Icon, label, onClick, color = "text-foreground" }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3.5 hover:bg-primary/5 rounded-2xl transition group text-right">
      <Icon className={`w-4 h-4 opacity-40 group-hover:opacity-100 transition ${color}`} />
      <span className={`text-xs font-bold ${color}`}>{label}</span>
    </button>
  );
    }
